import {
    ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL,
    ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION,
} from './shared/options';

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

            if (ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION) {
                config.test.browser.testerScripts.push({
                    src: '@lwc/synthetic-shadow/dist/index.js',
                });
            }

            if (ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL) {
                config.test.browser.testerScripts.push({
                    src: '@lwc/aria-reflection/dist/index.js',
                });
            }

            return config;
        },
    };
}
