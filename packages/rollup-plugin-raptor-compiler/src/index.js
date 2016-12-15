const compiler = require('raptor-compiler-core');

module.exports = (options) => {
    return {
        transform (code, id) {
            const pluginOptions = {};
            const config = { componentPath: id };
            return compiler.compile(config, pluginOptions);
        }
    }
}