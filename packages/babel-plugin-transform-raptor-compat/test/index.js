/* eslint-env node */

const path = require('path');
const fixturesDir = path.join(__dirname, 'fixtures');
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

babelFixtureTransform(fixturesDir, BABEL_CONFIG_NO_OPTIONS);
babelFixtureTransform(fixturesDir, BABEL_CONFIG_GLOBAL);
