module.exports = {
    extends: [
        './commitlint.types.js',
        '@commitlint/config-conventional', // scoped packages are not prefixed
    ],
}
