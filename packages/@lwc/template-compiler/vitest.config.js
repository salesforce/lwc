import { mergeConfig, defineProject } from 'vitest/config';
import sharedConfig from '../../../vitest.shared';
import rollupConfig from '../../../scripts/rollup/rollup.config';

export default mergeConfig(
    sharedConfig,
    defineProject({
        test: {
            name: 'lwc-template-compiler',
        },
        plugins: rollupConfig.plugins,
    })
);
