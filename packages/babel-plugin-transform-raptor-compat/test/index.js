/* eslint-env node */

const path = require('path');
const fixturesDir = path.join(__dirname, 'fixtures');
const fixturesTransformDir = path.join(fixturesDir, 'moduleTransforms');
const modulesTransformDir = path.join(fixturesDir, 'globalTransforms');
const { babelFixtureTransform } = require('raptor-helper-fixture');
const transfromRaptorCompat = require('../src/index');

const BABEL_CONFIG_NO_OPTIONS = {
    plugins: [
        [transfromRaptorCompat]
    ],
    parserOpts: {
        plugins: ['*']
    }
}

const BABEL_CONFIG_MODULE = {
    plugins: [
        [transfromRaptorCompat, {
            resolveProxyCompat: {
                module: 'proxy-compat'
            }
        }]
    ],
    parserOpts: {
        plugins: ['*']
    }
};

const BABEL_CONFIG_GLOBAL = {
    plugins: [
        [transfromRaptorCompat, {
            resolveProxyCompat: {
                global: 'window.Proxy'
            }
        }]
    ],
    parserOpts: {
        plugins: ['*']
    }
};

babelFixtureTransform(fixturesTransformDir, BABEL_CONFIG_NO_OPTIONS);
babelFixtureTransform(fixturesTransformDir, BABEL_CONFIG_MODULE);
babelFixtureTransform(modulesTransformDir, BABEL_CONFIG_GLOBAL);
