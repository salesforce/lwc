import * as options from '../helpers/options.js';
import createConfig from './shared/base-config.js';
import hydrationTestPlugin from './plugins/serve-hydration.js';

const SHADOW_MODE = options.SHADOW_MODE_OVERRIDE ?? 'native';

const baseConfig = createConfig({
    ...options,
    NATIVE_SHADOW: SHADOW_MODE === 'native' || options.FORCE_NATIVE_SHADOW_MODE_FOR_TEST,
});

/** @type {import("@web/test-runner").TestRunnerConfig} */
export default {
    ...baseConfig,
    files: ['test-hydration/**/*.spec.js', '!test-hydration/synthetic-shadow/index.spec.js'],
    plugins: [...baseConfig.plugins, hydrationTestPlugin],
    coverageConfig: {
        ...baseConfig.coverageConfig,
        threshold: {
            lines: 60,
            statements: 60,
            branches: 70,
            functions: 55,
        },
    },
};
