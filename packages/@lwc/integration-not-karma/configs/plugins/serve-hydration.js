import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { rollup } from 'rollup';
import lwcRollupPlugin from '@lwc/rollup-plugin';
import { DISABLE_STATIC_CONTENT_OPTIMIZATION, ENGINE_SERVER } from '../../helpers/options.js';
/** LWC SSR module to use when server-side rendering components. */
const lwcSsr = await (ENGINE_SERVER
    ? // Using import('literal') rather than import(variable) so static analysis tools work
      import('@lwc/engine-server')
    : import('@lwc/ssr-runtime'));

lwcSsr.setHooks({
    sanitizeHtmlContent(content) {
        return content;
    },
});

const ROOT_DIR = path.join(import.meta.dirname, '../..');
const COMPONENT_NAME = 'x-main';
const COMPONENT_ENTRYPOINT = 'x/main/main.js';

async function compileModule(input, targetSSR, format) {
    const modulesDir = path.join(ROOT_DIR, input.slice(0, -COMPONENT_ENTRYPOINT.length));
    const bundle = await rollup({
        input,
        plugins: [
            lwcRollupPlugin({
                targetSSR,
                modules: [{ dir: modulesDir }],
                experimentalDynamicComponent: {
                    loader: fileURLToPath(new URL('../../helpers/loader.js', import.meta.url)),
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
    // To minimize the amount of code in the generated script, ideally we'd do `import Component`
    // and delegate the bundling to the loader. However, that's complicated to configure and using
    // imports with vm.Script/vm.Module is still experimental, so we use an IIFE for simplicity.
    // Additionally, we could import LWC, but the framework requires configuration before each test
    // (setHooks/setFeatureFlagForTest), so instead we configure it once in the top-level context
    // and inject it as a global variable.
    const script = new vm.Script(
        `(async () => {
            const {default: config} = await import('./${configPath}');
            ${componentIife /* var Component = ... */}
            return LWC.renderComponent(
                '${COMPONENT_NAME}',
                Component,
                config.props || {},
                false,
                'sync'
            );
        })()`,
        {
            filename: `[SSR] ${configPath}`,
            importModuleDynamically: vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER,
        }
    );

    return await script.runInContext(vm.createContext({ LWC: lwcSsr }));
}

/**
 * Hydration test `index.spec.js` files are actually config files, not spec files.
 * This function wraps those configs in the test code to be executed.
 */
async function wrapHydrationTest(configPath) {
    const { default: config } = await import(path.join(ROOT_DIR, configPath));

    try {
        config.requiredFeatureFlags?.forEach((featureFlag) => {
            lwcSsr.setFeatureFlagForTest(featureFlag, true);
        });

        const suiteDir = path.dirname(configPath);
        const componentEntrypoint = path.join(suiteDir, COMPONENT_ENTRYPOINT);
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
    } finally {
        config.requiredFeatureFlags?.forEach((featureFlag) => {
            lwcSsr.setFeatureFlagForTest(featureFlag, false);
        });
    }
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
