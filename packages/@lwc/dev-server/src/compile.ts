// given a component entry point, compile the component
import path from 'path';
import { rollup } from 'rollup';
import rollupLwcCompilerPlugin from '@lwc/rollup-plugin';

const globalModules = {
    lwc: 'LWC',
};

function createRollupInputConfig() {
    return {
        external: function (id: string) {
            return id in globalModules;
        },
        plugins: [rollupLwcCompilerPlugin({ enableHmr: true })].filter(Boolean),
    };
}

export async function compile(
    src: string,
    filename: string
): Promise<{ code: string; warnings: string[] }> {
    const warnings: string[] = [];
    const bundle = await rollup({
        ...createRollupInputConfig(),
        input: filename,
        onwarn(warning) {
            warnings.push(warning.message);
        },
    });
    const { output } = await bundle.generate({
        format: 'iife',
        globals: globalModules,
        name: path.basename(filename),
    });

    const { code } = output[0];
    return { code, warnings };
}
