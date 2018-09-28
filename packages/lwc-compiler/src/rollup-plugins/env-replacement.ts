import rollupPluginReplace from 'rollup-plugin-replace';

import { NormalizedCompilerOptions } from '../compiler/options';

export default function({ options }: { options: NormalizedCompilerOptions }) {
    const patterns: { [pattern: string]: string } = {};

    for (const [key, value] of Object.entries(options.outputConfig.env)) {
        patterns[`process.env.${key}`] = JSON.stringify(value);
    }

    return rollupPluginReplace({
        values: patterns,
    });
}
