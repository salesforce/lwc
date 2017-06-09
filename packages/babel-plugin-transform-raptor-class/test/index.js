/* eslint-env node */

const path = require('path');
const fixturesDir = path.join(__dirname, 'fixtures');
const fixturesTransformDir = path.join(fixturesDir, 'transforms');
const { transform, babelFixtureTransform } = require('raptor-helper-fixture');
const transfromRaptorClass = require('../src/index');
const assert = require('power-assert');

const BABEL_CONFIG = {
    plugins: [
        transfromRaptorClass
    ],
    parserOpts: {
        plugins: ['*']
    }
};

babelFixtureTransform(fixturesTransformDir, BABEL_CONFIG);
