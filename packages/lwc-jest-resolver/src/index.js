const { resolve, extname } = require('path');

const lwcNpmResolver = require('lwc-module-resolver');
const { default: defaultResolver } = require('jest-resolve/build/default_resolver');

const GLOBAL_CSS_MOCK = resolve(__dirname, '..', 'resources', 'globalStyleMock.js');

const lwcMap = lwcNpmResolver.resolveLwcNpmModules();

function getLwcPath(path) {
    if (extname(path) === '.css') {
        return GLOBAL_CSS_MOCK;
    }

    if (lwcMap[path]) {
        // handle magic LWC imports
        if (path === 'engine') {
            return require.resolve('lwc-engine');
        } else if (path === 'wire-service') {
            return require.resolve('lwc-wire-service');
        } else if (path === 'wire-service-jest-util') {
            return require.resolve('lwc-wire-service-jest-util');
        }
        return resolve(lwcMap[path].entry);
    }

    return path;
}

module.exports = function (path, options) {
    return defaultResolver(getLwcPath(path), options);
};
