import rollupPluginReplace from 'rollup-plugin-replace';

import { NormalizedCompilerOptions } from '../compiler/options';

export default function({ options }: { options: NormalizedCompilerOptions }) {
    const { env } = options.outputConfig;

    const patterns: { [pattern: string]: string } = {};
    if (env.NODE_ENV) {
        // Use JSON.stringify to add wrapping quotes around the env.NODE_ENV value. The
        // rollup-plugin-replace is doing a simple search and replace in the code, the wrapping
        // quote are necessary other it will produce an identifier instead of a string.
        patterns[`process.env.NODE_ENV`] = JSON.stringify(env.NODE_ENV);
    }

    return rollupPluginReplace({
        values: patterns,
    });
}
