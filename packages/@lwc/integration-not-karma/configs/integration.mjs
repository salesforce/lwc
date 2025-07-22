import baseConfig from './base.mjs';
import testPlugin from './plugins/serve-integration.mjs';

/** @type {import("@web/test-runner").TestRunnerConfig} */
export default {
    ...baseConfig,
    files: [
        // FIXME: These tests are just symlinks to integration-karma for now so the git diff smaller
        'test/**/*.spec.js',

        // Cannot reassign properties of module
        '!test/api/sanitizeAttribute/index.spec.js',

        // Hacky nonsense highly tailored to Karma
        '!test/custom-elements-registry/index.spec.js',

        // Logging mismatches
        '!test/accessibility/synthetic-cross-root-aria/index.spec.js',
        '!test/api/freezeTemplate/index.spec.js',
        '!test/component/LightningElement.addEventListener/index.spec.js',
        '!test/regression/invalid-key/index.spec.js',
        '!test/rendering/legacy-stylesheet-api/index.spec.js',
        '!test/rendering/sanitize-stylesheet-token/index.spec.js',

        // Needs clean <head>
        '!test/light-dom/multiple-templates/index.spec.js',
        '!test/light-dom/style-global/index.spec.js',
        '!test/misc/clean-dom/index.spec.js',
        '!test/swapping/styles/index.spec.js',

        // Implement objectContaining / arrayWithExactContents
        '!test/profiler/mutation-logging/index.spec.js',
    ],
    plugins: [...baseConfig.plugins, testPlugin],
};
