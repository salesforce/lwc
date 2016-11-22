/* eslint-env node, mocha */

const babel = require('babel-core');
const fs = require('fs');
const path = require('path');
const assert = require('power-assert');
const plugin = require('../src/index');

const fixturesDir = path.join(__dirname, 'fixtures');

const BABEL_CONFIG = {
    babelrc: false,
    plugins: [plugin],
    filename: './test.js',
    parserOpts: {
        plugins: ['*']
    }
};

function trim(str) {
    return str.toString().replace(/^\s+|\s+$/, '');
}

describe('assert', () => {
    it ('import and render added', () => {
        const fixtureClass = path.join(fixturesDir, 'simpleProp');
        const config = Object.assign(BABEL_CONFIG, { filename: './simpleProp.js' });
        const src = fs.readFileSync(path.join(fixtureClass, 'actual.js')).toString();

        const actual = babel.transform(src, config).code;
        console.log(actual);
        const expected = fs.readFileSync(path.join(fixtureClass, 'expected.js')).toString();
 
        assert.equal(trim(actual), trim(expected));
    });
});