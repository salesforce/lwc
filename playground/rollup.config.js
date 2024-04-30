import lwc from '@lwc/rollup-plugin';
import replace from '@rollup/plugin-replace';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const __ENV__ = process.env.NODE_ENV ?? 'development';

/** @type {import("rollup").RollupOptionsFunction} */
export default (args) => {
    return {
        input: 'compiled/main.js',

        output: {
            file: 'dist/main.js',
            format: 'esm',
            sourcemap: true,
        },

        plugins: [
            replace({
                'process.env.NODE_ENV': JSON.stringify(__ENV__),
                preventAssignment: true,
            }),
            lwc(),
            args.watch &&
                serve({
                    open: false,
                    port: 3000,
                }),
            args.watch && livereload('dist'),
        ],
    };
};
