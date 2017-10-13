#!/usr/bin/env babel-node
/* eslint-env node */

import * as path from 'path';
import { compile } from '../packages/raptor-compiler/src/index.js';

const args = process.argv.slice(2);
if (!args.length) {
    console.log(`[ERROR]: Missing parameters.
    Usage: ./bin/raptor-compiler-cli.js path/to/file.js
            --format [ amd | es6 | iife ]
            --mode [ dev | prod | compat | prod_compat | all ]`
    );
    process.exit();
}

const options = { format: 'es', mode: 'dev' };
let filePath, arg;

while (arg = args.shift()) {
    if (arg.indexOf('-') === 0) {
        options[arg.replace(/-/g, '')] = args.shift();
    } else {
        filePath = arg;
    }
}

const entry = path.resolve(filePath);


compile(entry, options)
.then((result) => {
    console.log('\n>> Code --------------------------------------------------');
    if (result.code) {
        console.log('\n', result.code);
    } else {
        Object.keys(result).map(r => console.log(`Mode: ${r}: `, result[r].code, '------------------------------------------------'));
    }
    console.log('>> End Code ------------------------------------------------');

    console.log('\n>> Metadata --------------------------------------------------');
    console.log('\n', result.metadata);
    console.log('>> End Metadata ------------------------------------------------');
})
.catch((err) => {
    console.log(err);
});
