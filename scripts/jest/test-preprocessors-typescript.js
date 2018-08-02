const tsc = require('typescript');
const { compilerOptions } = require('../../tsconfig.json');

module.exports = {
    process(src, path) {
        return tsc.transpile(src, compilerOptions, path, []);
    },
};
