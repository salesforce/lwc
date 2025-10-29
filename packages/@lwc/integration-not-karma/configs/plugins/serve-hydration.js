import { posix as ppath, sep } from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { rollup } from 'rollup';
import lwcRollupPlugin from '@lwc/rollup-plugin';
import { DISABLE_STATIC_CONTENT_OPTIMIZATION, ENGINE_SERVER } from '../../helpers/options.js';

/** Code for the LWC SSR module. */
const LWC_SSR = readFileSync(
    new URL(import.meta.resolve(ENGINE_SERVER ? '@lwc/engine-server' : '@lwc/ssr-runtime')),
    'utf8'
);

const ROOT_DIR = ppath.join(import.meta.dirname, '../..');
const COMPONENT_NAME = 'c-main';
const COMPONENT_ENTRYPOINT = 'c/main/main.js';

async function compileModule(input, targetSSR, format) {
    const modulesDir = ppath.join(ROOT_DIR, input.slice(0, -COMPONENT_ENTRYPOINT.length));
    const bundle = await rollup({
        input,
        plugins: [
            lwcRollupPlugin({
                targetSSR,
                modules: [{ dir: modulesDir }],
                experimentalDynamicComponent: {
                    loader: fileURLToPath(
                        new URL('../../helpers/loader.js', import.meta.url)
                    ).replaceAll(sep, ppath.sep),
                    strict: true,
                },
                enableSyntheticElementInternals: true,
                enableDynamicComponents: true,
                enableLwcOn: true,
                enableStaticContentOptimization: !DISABLE_STATIC_CONTENT_OPTIMIZATION,
                experimentalDynamicDirective: true,
            }),
        ],

        external: ['lwc', '@lwc/ssr-runtime'],

        onwarn(warning, warn) {
            // Ignore warnings from our own Rollup plugin
            if (warning.plugin !== 'rollup-plugin-lwc-compiler') {
                warn(warning);
            }
        },
    });

    const { output } = await bundle.generate({
        format,
        name: 'Component',
        globals: {
            lwc: 'LWC',
            '@lwc/ssr-runtime': 'LWC',
        },
    });

    return output[0].code;
}

/**
 * This function takes a path to a component definition and a config file and returns the
 * SSR-generated markup for the component. It does so by compiling the component and then
 * running a script in a separate JS runtime environment to render it.
 */
async function getSsrMarkup(componentEntrypoint, configPath) {
    const componentIife = await compileModule(componentEntrypoint, !ENGINE_SERVER, 'iife');
    // Ideally, we'd be able to do `import Component` and delegate bundling to the loader. We also
    // need each import of LWC to be isolated, but by all server-side imports share a global state.
    // We could solve this with the right `vm.Script`/`vm.Module` setup, but that's complicated and
    // still experimental. Therefore, we just inline everything.
    const script = new vm.Script(
        `(async () => {
            // node.js / CommonJS setup
            const process = { env: ${JSON.stringify(process.env)} };
            const exports = Object.create(null);
            const LWC = exports;

            // LWC / test setup
            ${LWC_SSR};
            LWC.setHooks({ sanitizeHtmlContent: (v) => v });
            const { default: config } = await import('./${configPath}');
            config.requiredFeatureFlags?.forEach(ff => {
                LWC.setFeatureFlagForTest(ff, true);
            });

            // Component code
            ${componentIife};
            return LWC.renderComponent(
                '${COMPONENT_NAME}',
                Component,
                config.props || {},
                false,
                'sync'
            );
        })()`,
        {
            filename: `(virtual SSR file for) ${configPath}`,
            importModuleDynamically: vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER,
        }
    );

    return await script.runInNewContext();
}

/**
 * Hydration test `index.spec.js` files are actually config files, not spec files.
 * This function wraps those configs in the test code to be executed.
 */
async function wrapHydrationTest(configPath) {
    const suiteDir = ppath.posix.dirname(configPath);
    const componentEntrypoint = ppath.join(suiteDir, COMPONENT_ENTRYPOINT);
    const ssrOutput = await getSsrMarkup(componentEntrypoint, configPath);

    return `
    import * as LWC from 'lwc';
    import { runTest } from '/configs/plugins/test-hydration.js';
    runTest(
        '/${configPath}?original=1',
        '/${componentEntrypoint}',
        ${JSON.stringify(ssrOutput) /* escape quotes */}
    );
    `;
}

/** @type {import('@web/dev-server-core').Plugin} */
export default {
    name: 'lwc-hydration-plugin',
    async serve(ctx) {
        // Hydration test "index.spec.js" files are actually just config files.
        // They don't directly define the tests. Instead, when we request the file,
        // we wrap it with some boilerplate. That boilerplate must include the config
        // file we originally requested, so the ?original query parameter is used
        // to return the file unmodified.
        if (ctx.path.endsWith('.spec.js') && !ctx.query.original) {
            return await wrapHydrationTest(ctx.path.slice(1)); // remove leading /
        } else if (ctx.path.endsWith('/' + COMPONENT_ENTRYPOINT)) {
            return await compileModule(ctx.path.slice(1) /* remove leading / */, false, 'esm');
        }
    },
};
