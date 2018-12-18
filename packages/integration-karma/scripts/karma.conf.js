const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..');

const LWC_ENGINE = require.resolve('@lwc/engine/dist/umd/es2017/engine.js');
const LWC_ENGINE_COMPAT = require.resolve('@lwc/engine/dist/umd/es5/engine.js');

const POLYFILL_COMPAT = require.resolve('es5-proxy-compat/polyfills.js');

function createPattern(location) {
    return {
        pattern: location,
    }
}

/**
 * More details here:
 * https://karma-runner.github.io/3.0/config/configuration-file.html
 */
module.exports = config => {
    const files = config.compat ?
        [createPattern(POLYFILL_COMPAT), createPattern(LWC_ENGINE_COMPAT)] :
        [createPattern(LWC_ENGINE)];

    config.set({
        basePath: BASE_DIR,
        files: [
            ...files,
            createPattern('dist/**/*.spec.js'),
        ],
        browsers: ['Chrome'],
        frameworks: ['jasmine'],
        plugins: [
            'karma-chrome-launcher',
            'karma-jasmine'
        ]
    });
};
