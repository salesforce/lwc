const babel = require('@babel/core');
const babelPlugin = require('../babel-plugin');

module.exports = function rollupLwcFeatures(options = {}) {
    return {
        name: 'rollup-plugin-lwc-features',
        transform(source) {
            return babel.transform(source, {
                plugins: [[babelPlugin, options]],
            }).code;
        },
    };
};
