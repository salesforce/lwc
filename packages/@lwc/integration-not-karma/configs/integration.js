import baseConfig from './base.js';
import testPlugin from './plugins/serve-integration.js';

/** @type {import("@web/test-runner").TestRunnerConfig} */
export default {
    ...baseConfig,
    files: [
        // FIXME: These tests are just symlinks to integration-karma for now so the git diff smaller
        'test/**/*.spec.js',

        // Hacky nonsense highly tailored to Karma
        '!test/custom-elements-registry/index.spec.js',

        // Logging mismatches
        '!test/component/LightningElement.addEventListener/index.spec.js',

        // Implement objectContaining / arrayWithExactContents
        '!test/profiler/mutation-logging/index.spec.js',
    ],
    plugins: [...baseConfig.plugins, testPlugin],
};
