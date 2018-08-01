const babelCore = require('@babel/core');
const BABEL_CONFIG = {
    babelrc: false,
    "plugins": [
        ["@babel/plugin-transform-modules-commonjs", {
            "allowTopLevelThis": true
        }]
    ],
    "retainLines": true,
    "parserOpts": {
        "plugins": ["objectRestSpread"]
    }
};

module.exports = {
    process(src, path) {
        return babelCore.transform(src, BABEL_CONFIG);
    }
};
