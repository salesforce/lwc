#!/usr/bin/env babel-node
/* eslint-env node */
import { compile } from '../packages/raptor-compiler-core/src/index.js';
import * as path from 'path';

const filePath = process.argv[2] || '';
const entry = path.resolve(filePath);
const options = {
    format: 'amd',
    mode: 'all',
};

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
