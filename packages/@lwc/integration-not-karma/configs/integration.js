import { importMapsPlugin } from '@web/dev-server-import-maps';
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

        // Broken in CI?
        '!test/lwc-on/index.spec.js',
        '!test/api/sanitizeAttribute/index.spec.js',
        '!test/template-expressions/errors/index.spec.js',
        '!test/template-expressions/smoke-test/index.spec.js',
    ],
    plugins: [
        ...baseConfig.plugins,
        importMapsPlugin({ inject: { importMap: { imports: { lwc: './mocks/lwc.js' } } } }),
        testPlugin,
    ],
};
