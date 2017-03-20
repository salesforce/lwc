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

describe('Class dependency calculation ', () => {
    it('Test used dependency', () => {
        const usedDep = path.join(fixturesDir, 'dependencies/used-dependency.js');
        const { metadata : { classDependencies } } = transform(usedDep, BABEL_CONFIG);
        const expected = ['external-lib'];

        assert(classDependencies.length === 1, `Expected dependency ${expected}`);
        assert.deepStrictEqual(classDependencies, expected, `Expected depdendency ${expected}`);
    });

    it('Test unused dependency', () => {
        const usedDep = path.join(fixturesDir, 'dependencies/unused-dependency.js');
        const { metadata : { classDependencies } } = transform(usedDep, BABEL_CONFIG);
        const expected = [];
        assert.deepStrictEqual(classDependencies, expected, `Expected no dependencies`);
    });
});
