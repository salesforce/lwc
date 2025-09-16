import { importMapsPlugin } from '@web/dev-server-import-maps';
import baseConfig from './base.js';
import testPlugin from './plugins/serve-integration.js';

/** @type {import("@web/test-runner").TestRunnerConfig} */
export default {
    ...baseConfig,
    files: [
        'test/lwc-on/index.spec.js',
        'test/template-expressions/errors/index.spec.js',
        'test/template-expressions/smoke-test/index.spec.js',
    ],
    plugins: [
        ...baseConfig.plugins,
        importMapsPlugin({ inject: { importMap: { imports: { lwc: './mocks/lwc.js' } } } }),
        testPlugin,
    ],
};
