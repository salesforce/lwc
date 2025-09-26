// Use native shadow by default in hydration tests; MUST be set before imports
process.env.DISABLE_SYNTHETIC ??= '1';
import baseConfig from './base.js';
import hydrationTestPlugin from './plugins/serve-hydration.js';

/** @type {import("@web/test-runner").TestRunnerConfig} */
export default {
    ...baseConfig,
    files: ['test-hydration/**/*.spec.js'],
    plugins: [...baseConfig.plugins, hydrationTestPlugin],
};
