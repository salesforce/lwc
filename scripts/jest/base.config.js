module.exports = {
    preset: 'ts-jest/presets/js-with-ts',

    globals: {
        'ts-jest': {
            // The tsconfig location has to be specified otherwise, it will not transform the javascript
            // files.
            tsConfig: 'tsconfig.json',

            // By default ts-jest reports typescript compilation errors. Let's disable for now diagnostic
            // reporting since some of the packages doesn't pass the typescript compilation.
            diagnostics: false,
        },
    },

    testMatch: ['<rootDir>/**/__tests__/*.spec.(js|ts)'],
};
