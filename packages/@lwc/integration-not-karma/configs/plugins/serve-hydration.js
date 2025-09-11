import path from 'node:path';
import vm from 'node:vm';
import fs from 'node:fs/promises';
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

// Like `fs.existsSync` but async
async function exists(path) {
    try {
        await fs.access(path);
        return true;
    } catch (_err) {
        return false;
    }
}

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
                enableDynamicComponents: true,
                enableLwcOn: true,
                enableStaticContentOptimization: !DISABLE_STATIC_CONTENT_OPTIMIZATION,
                experimentalDynamicDirective: true,
            }),
        ],

        external: ['lwc', '@lwc/ssr-runtime', 'test-utils', '@test/loader'], // @todo: add ssr modules for test-utils and @test/loader

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
 * This is the function that takes SSR bundle code and test config, constructs a script that will
 * run in a separate JS runtime environment with its own global scope. The `context` object
 * (defined at the top of this file) is passed in as the global scope for that script. The script
 * runs, utilizing the `LWC` object that we've attached to the global scope, it sets a
 * new value (the rendered markup) to `globalThis.moduleOutput`, which corresponds to
 * `context.moduleOutput in this file's scope.
 *
 * So, script runs, generates markup, & we get that markup out and return it for use
 * in client-side tests.
 */
async function getSsrCode(moduleCode, filePath) {
    // LWC itself requires configuration before each test (`setHooks` and
    // `setFeatureFlagForTest`). Ideally, this would be done in pure isolation,
    // but getting that set up for `vm.Script`/`vm.Module` is non-trivial.
    // Instead, we inject a shared LWC that gets configured outside the script.
    const script = new vm.Script(
        `(async () => {
            const {default: config} = await import('./${filePath}');
            ${moduleCode /* var Component = ... */}
            return LWC.renderComponent(
                '${COMPONENT_NAME}',
                Component,
                config.props || {},
                false,
                'sync'
            );
        })()`,
        {
            filename: `[SSR] ${filePath}`,
            importModuleDynamically: vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER,
        }
    );

    return await script.runInContext(vm.createContext({ LWC: lwcSsr }));
}

async function existsUp(dir, file) {
    while (true) {
        if (await exists(path.join(dir, file))) return true;
        dir = path.join(dir, '..');
        const basename = path.basename(dir);
        if (basename === '.') return false;
    }
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
        // You can add an `.only` file alongside an `index.spec.js` file to make it `fdescribe()`
        const onlyFileExists = await existsUp(suiteDir, '.only');

        const componentDefSSR = await compileModule(componentEntrypoint, !ENGINE_SERVER, 'iife');
        const ssrOutput = await getSsrCode(componentDefSSR, configPath);

        return `
        import { runTest } from '/helpers/test-hydrate.js';
        runTest(
            '/${configPath}?original=1',
            '/${componentEntrypoint}',
            ${JSON.stringify(ssrOutput) /* escape quotes */},
            ${onlyFileExists}
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
    async serve(ctx) {
        // Hydration test "index.spec.js" files are actually just config files.
        // They don't directly define the tests. Instead, when we request the file,
        // we wrap it with some boilerplate. That boilerplate must include the config
        // file we originally requested, so the ?original query parameter is used
        // to return the file unmodified.
        if (ctx.path.endsWith('.spec.js') && !ctx.query.original) {
            return await wrapHydrationTest(ctx.path.slice(1)); // remove leading /
        } else if (ctx.path.endsWith('/' + COMPONENT_ENTRYPOINT)) {
            return compileModule(ctx.path.slice(1) /* remove leading / */, false, 'esm');
        }
    },
};
