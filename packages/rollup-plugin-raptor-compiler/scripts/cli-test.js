#!/usr/bin/env babel-node
/* eslint-env node, mocha */
const fs = require('fs');
const path = require('path');
const rollup = require('rollup');
const rollupCompile = require('../src/index');

function doRollup(filePath, options) {
    return rollup.rollup({
        entry: filePath,
        plugins: [ rollupCompile(options) ]
    });
}

const entryFile = path.resolve(__dirname + '/../test/fixtures/bundle/app.js');

doRollup(entryFile, { componentNamespace: 'test' })
.then((bundle) => {
    const actual = bundle.generate({}).code;
    console.log(actual);
})
.catch((error) => {
    console.log(error);
});
