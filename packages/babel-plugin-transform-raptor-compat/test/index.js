/* eslint-env node */

const path = require('path');
const fixturesDir = path.join(__dirname, 'fixtures');
const fixturesTransformDir = path.join(fixturesDir, 'transforms');
const { babelFixtureTransform } = require('raptor-helper-fixture');
const transfromRaptorCompat = require('../src/index');

const BABEL_CONFIG = {
    plugins: [
        transfromRaptorCompat
    ],
    parserOpts: {
        plugins: ['*']
    }
};

babelFixtureTransform(fixturesTransformDir, BABEL_CONFIG);
