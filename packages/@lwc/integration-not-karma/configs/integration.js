import { importMapsPlugin } from '@web/dev-server-import-maps';
import * as options from '../helpers/options.js';
import createConfig from './shared/base-config.js';
import testPlugin from './plugins/serve-integration.js';

const SHADOW_MODE = options.SHADOW_MODE_OVERRIDE ?? 'synthetic';

const baseConfig = createConfig({
    ...options,
    NATIVE_SHADOW: SHADOW_MODE === 'native' || options.FORCE_NATIVE_SHADOW_MODE_FOR_TEST,
});

/** @type {import("@web/test-runner").TestRunnerConfig} */
export default {
    ...baseConfig,
    files: [
        'test/**/*.spec.js',
        '!test/custom-elements/index.spec.js',
        // Don't work on Windows?
        '!test/template-expressions/errors/index.spec.js',
        '!test/template-expressions/smoke-test/index.spec.js',
    ],
    plugins: [
        ...baseConfig.plugins,
        // Only used for the `sanitizeAttribute` test
        importMapsPlugin({ inject: { importMap: { imports: { lwc: './mocks/lwc.js' } } } }),
        testPlugin,
    ],
};
