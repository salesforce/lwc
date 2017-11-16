/* eslint eslint-comments/no-use: off */
/* eslint-env node */
const path = require('path');
const raptorCompiler = require('rollup-plugin-raptor-compiler');
const nodeResolve = require('rollup-plugin-node-resolve');

function resolver() {
    const re = new RegExp("^([^-]+)-(.+)$");
    return {
        resolveId: (id) => {
            // wire service itself (no namespace)
            if (id === 'wire-service') {
                return path.resolve('./src/main.js');
            } else if (id === 'engine') {
                return require.resolve('raptor-engine').replace('commonjs', 'modules');
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
    sourceMap: false,
    plugins: [
        resolver(),
        raptorCompiler({ mapNamespaceFromPath: true }),
        nodeResolve({ module: true }),
    ].filter(Boolean),
};
