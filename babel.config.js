const babelFeaturesPlugin = require('@lwc/features/src/babel-plugin');

module.exports = {
    presets: [
        '@babel/preset-typescript',
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current',
                }
            },
        ],
    ],
    plugins: [
        babelFeaturesPlugin,
        ["@babel/plugin-proposal-class-properties", { "loose": true }],
    ],
};
