#!/usr/bin/env babel-node
/* eslint-env node */


const path = require('path');
const rollup = require('rollup');
const rollupCompile = require('../src/index');

const entryFile = path.resolve(__dirname + '/../test/fixtures/simpleApp/src/main.js');

rollup.rollup({
    entry: entryFile,
    plugins: [ rollupCompile({})]
})
.then((bundle) => {
    const actual = bundle.generate({}).code;
    console.log(actual);
})
.catch((error) => {
    console.log(error);
});
