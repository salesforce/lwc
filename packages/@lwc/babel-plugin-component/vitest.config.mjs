import { mergeConfig, defineProject } from 'vitest/config';
import sharedConfig from '../../../vitest.shared.mjs';
import pkg from '../../../package.json';
const LWC_VERSION = pkg.version;

export default mergeConfig(
    sharedConfig,
    defineProject({
        test: {
            name: 'babel-plugin-component',
            // Workaround to fix `const enum`, which is required because we use e.g. `APIFeature` from `@lwc/shared`
            // See https://github.com/vitest-dev/vitest/discussions/3964
            alias: {
                '@lwc/shared': '@lwc/shared/src',
            },
        },
        define: {
            'process.env.LWC_VERSION': JSON.stringify(LWC_VERSION),
        },
    })
);
