import path from 'path';
import { rollup } from 'rollup';
import lwc from '../index';
import type { OutputChunk, Plugin, RollupLog } from 'rollup';
import type { RollupLwcOptions } from '../index';

export async function runRollup(
    pathname: string,
    pluginOptions: RollupLwcOptions = {},
    {
        external = [],
        plugins = [],
    }: {
        external?: string[];
        plugins?: Plugin[];
    } = {}
): Promise<OutputChunk & { warnings: RollupLog[] }> {
    const warnings: RollupLog[] = [];
    const bundle = await rollup({
        input: path.resolve(import.meta.dirname, 'fixtures', pathname),
        plugins: [lwc(pluginOptions), plugins],
        external: ['lwc', ...external],
        onwarn(warning) {
            warnings.push(warning);
        },
    });

    const {
        output: [output],
    } = await bundle.generate({
        format: 'esm',
    });

    return {
        ...output,
        warnings,
    };
}
