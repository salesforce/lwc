// eslint-disable-next-line no-undef
module.exports = {
    presets: ['@babel/preset-typescript'],
    plugins: [
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        '@babel/transform-modules-commonjs',
    ],
};
