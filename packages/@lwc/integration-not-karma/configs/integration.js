import { importMapsPlugin } from '@web/dev-server-import-maps';
import baseConfig from './base.js';
import testPlugin from './plugins/serve-integration.js';

/** @type {import("@web/test-runner").TestRunnerConfig} */
export default {
    ...baseConfig,
    files: [
        'test/**/*.spec.js',
        // Implement objectContaining / arrayWithExactContents
        '!test/profiler/mutation-logging/index.spec.js',
    ],
    plugins: [
        ...baseConfig.plugins,
        importMapsPlugin({ inject: { importMap: { imports: { lwc: './mocks/lwc.js' } } } }),
        testPlugin,
    ],
};
