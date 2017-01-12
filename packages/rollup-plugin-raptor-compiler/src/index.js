/* eslint-env node */
const compiler = require('raptor-compiler-core');

module.exports = (options) => {
    return {
        transform (code, fileName) {
            return compiler.compile(fileName, Object.assign({}, options, {
                sources: { [fileName]: code }
            }));
        }
    }
}