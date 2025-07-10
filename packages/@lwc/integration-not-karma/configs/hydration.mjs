// Use native shadow by default in hydration tests; MUST be set before imports
process.env.DISABLE_SYNTHETIC ??= 'true';
import baseConfig from './base.mjs';
import wrapHydrationTest from './plugins/serve-hydration.mjs';

/** @type {import("@web/test-runner").TestRunnerConfig} */
export default {
    ...baseConfig,
    files: [
        // FIXME: These tests are just symlinks to integration-karma for now so the git diff smaller
        'test-hydration/**/*.spec.js',
        // FIXME: hits timeout?
        '!test-hydration/light-dom/scoped-styles/replace-scoped-styles-with-dynamic-templates/index.spec.js',
        // FIXME: This uses ENABLE_SYNTHETIC_SHADOW_IN_MIGRATION to detect status,
        // we should just use DISABLE_SYNTHETIC instead
        '!test-hydration/synthetic-shadow/index.spec.js',
    ],
    plugins: [
        ...baseConfig.plugins,
        {
            async serve(ctx) {
                // Hydration test "index.spec.js" files are actually just config files.
                // They don't directly define the tests. Instead, when we request the file,
                // we wrap it with some boilerplate. That boilerplate must include the config
                // file we originally requested, so the ?original query parameter is used
                // to return the file unmodified.
                if (ctx.path.endsWith('.spec.js') && !ctx.query.original) {
                    return await wrapHydrationTest(ctx.path.slice(1)); // remove leading /
                }
            },
        },
    ],
};
