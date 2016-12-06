#!/usr/bin/env babel-node

import * as acorn from 'acorn';
import * as fs from 'fs';

import {compile} from '../src/index';
import path from 'path';

const skipTests = [
    '.babelrc',
    '.DS_Store',
    'classAndTemplate'
];

const fixturesDir = path.join(__dirname + '/../test/', 'fixtures');

const TEST_SRCS = {
    empty: {
        sourceTemplate : `
            <template>
                <section>
                    <p>{test}</p>
                </section>
            </template>
        `, 
        sourceClass: `
            export default class Bar {
                test = 'foo';
                constructor() {}
            }
        `,
        sourceCSS: ''
    }
};

fs.readdirSync(fixturesDir).map((caseName) => {
    if (skipTests.indexOf(caseName) >= 0) return;
    const fixtureCaseDir = path.join(fixturesDir, caseName);

    const initialConfig = { componentPath: path.join(fixtureCaseDir, caseName + '.js') };
    const config = Object.assign({}, TEST_SRCS[caseName] || {}, initialConfig);

    return runCompile(config, {})
    .then((actual) => {
        console.log(actual.code);
    })
    .catch((error) => {
        console.log(error);
    });
});



function runCompile(config, options = {}) {
    return compile(config, options);
}