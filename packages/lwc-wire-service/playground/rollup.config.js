/* eslint eslint-comments/no-use: off */
/* eslint-env node */
const path = require('path');
const lwcCompiler = require('rollup-plugin-lwc-compiler');
const nodeResolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');

function resolver() {
    const re = new RegExp("^([^-]+)-(.+)$");
    return {
        resolveId: (id) => {
            // wire service itself (no namespace)
            if (id === 'wire-service') {
                return require.resolve('lwc-wire-service').replace('commonjs', 'modules');
            } else if (id === 'engine') {
                return require.resolve('lwc-engine').replace('commonjs', 'modules');
            // test and wire namespace components
            } else if (id.indexOf('x') === 0) {
                const [, ns, cmp] = re.exec(id);
                return path.resolve('./playground/' + ns + '/' + cmp + '/' + cmp + '.js');
            }
            // unknown
            return undefined;
        }
    };
}

module.exports = {
    input: path.resolve('playground/app.js'),
    output: {
        file: path.resolve('playground/index.js'),
        format: 'iife'
    },
    name: 'Main',
    plugins: [
        resolver(),
        lwcCompiler({ mapNamespaceFromPath: true }),
        nodeResolve({ module: true }),
        replace({ 'process.env.NODE_ENV': JSON.stringify('development') }),
    ].filter(Boolean),
};
