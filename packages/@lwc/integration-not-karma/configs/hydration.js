// Use native shadow by default in hydration tests; MUST be set before imports
process.env.DISABLE_SYNTHETIC ??= 'true';
import baseConfig from './base.js';
import hydrationTestPlugin from './plugins/serve-hydration.js';

/** @type {import("@web/test-runner").TestRunnerConfig} */
export default {
    ...baseConfig,
    files: [
        // FIXME: These tests are just symlinks to integration-karma for now so the git diff smaller
        'test-hydration/**/*.spec.js',
        // FIXME: hits timeout?
        '!test-hydration/light-dom/scoped-styles/replace-scoped-styles-with-dynamic-templates/index.spec.js',
    ],
    plugins: [...baseConfig.plugins, hydrationTestPlugin],
};
