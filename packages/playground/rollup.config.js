import lwc from '@lwc/rollup-plugin';
import replace from '@rollup/plugin-replace'

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/bundle.js',
        format: 'cjs'
    },
    plugins: [
        lwc(),
        replace({
            values: {
                'process.env.NODE_ENV': JSON.stringify('dev')
            }
        })
    ]
}