#!/usr/bin/env babel-node

import * as acorn from 'acorn';
import * as fs from 'fs';

import {compile} from '../src/index';
import path from 'path';

const skipTests = [
    '.babelrc',
    '.DS_Store',
];

const BASE_CONFIG = {};
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
    const config = Object.assign({}, BASE_CONFIG, options);    
    return compile({ entry: filePath }, config);
}

// -- Acorn test ---------------------------------------------------------------------
// const src = fs.readFileSync(__dirname+'/../test/fixtures/classAndTemplate/classAndTemplate.js').toString();

// const result = acorn.parse(src, {
//     sourceType: 'module',
//     ecmaVersion: 7
// });


// -- Babylon test ----------------------------------------------------------------------------------------
//const src = fs.readFileSync(__dirname+'/../test/fixtures/classAndTemplate/classAndTemplate.js').toString())
// const ast = babylon.parse(src, {
//   // parse in strict mode and allow module declarations
//   sourceType: "module",
//   plugins: ['*']
// });

// console.log('AST: ', !!ast);


// const result = babel.transform(src, {
//     parserOpts: {
//         plugins: ['*']
//     }
// });

// console.log(result.code);