import { mergeConfig, defineProject } from 'vitest/config';
import sharedConfig from '../../../vitest.shared.mjs';

export default mergeConfig(
    sharedConfig,
    defineProject({
        plugins: [
            {
                name: 'disable-vite-css-plugin',
                configResolved(config) {
                    config.plugins = config.plugins.filter((plugin) => plugin.name !== 'vite:css');

                    config.plugins = config.plugins.filter(
                        (plugin) => plugin.name !== 'vite:css-post'
                    );
                },
            },
        ],
        test: {
            name: 'lwc-style-compiler',
            css: true,
        },
    })
);
