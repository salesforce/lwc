/* eslint-env node */

const path = require('path');
const { babelFixtureTransform } = require('raptor-helper-fixture');

const transfromRaptorClass = require('../src/index');

babelFixtureTransform(path.join(__dirname, 'fixtures'), {
    plugins: [
        transfromRaptorClass
    ],
    parserOpts: {
        plugins: ['*']
    }
});