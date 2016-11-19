#!/usr/bin/env babel-node

import * as fs from 'fs';
import * as path from 'path';

import {compile} from '../src/index';

const skipTests = [
    '.babelrc',
    '.DS_Store',
];

const fixturesDir = path.join(__dirname + '/../test/', 'fixtures');

fs.readdirSync(fixturesDir).map((caseName) => {
    if (skipTests.indexOf(caseName) >= 0) return;

    const fixtureCaseDir = path.join(fixturesDir, caseName);
    return runCompile(path.join(fixtureCaseDir, caseName + '.js'))
    .then((actual) => {
        console.log(actual.code);
    })
    .catch((error) => {
        console.log(error);
    });
});

function runCompile(filePath, options = {}) {
    return compile({ entry: filePath }, options);
}