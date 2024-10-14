import type { Plugin } from 'vitest/config';

export default function vitestPluginLwcConfig(): Plugin {
    return {
        name: 'vitest-plugin-lwc-config',
        enforce: 'pre',
        config(config) {
            if (!config.test) {
                throw new Error('Expected test configuration');
            }

            if (!config.test.browser) {
                throw new Error('Expected browser configuration');
            }

            config.test.browser.testerScripts ??= [];

            if (process.env.ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION) {
                config.test.browser.testerScripts.push({
                    src: '@lwc/synthetic-shadow/dist/index.js',
                });
            }

            if (process.env.ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL) {
                config.test.browser.testerScripts.push({
                    src: '@lwc/aria-reflection/dist/index.js',
                });
            }

            return config;
        },
    };
}
