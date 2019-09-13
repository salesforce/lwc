// eslint-disable-next-line no-undef
const babelFeaturesPlugin = require('@lwc/features/src/babel-plugin');

// eslint-disable-next-line no-undef
module.exports = {
    presets: [
        "@babel/preset-typescript"
    ],
    plugins: [
        babelFeaturesPlugin,
        ["@babel/plugin-proposal-class-properties", { "loose": true }],
        "@babel/transform-modules-commonjs",
    ],
};
