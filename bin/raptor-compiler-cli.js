#!/usr/bin/env babel-node
/* eslint-env node */

import { compile } from '../packages/raptor-compiler-core/src/index.js';
import path from 'path';

const filePath = process.argv[2] || '';
const entry = path.resolve(filePath);
const options = {format: 'aura'};

compile(entry, options)
.then((result) => {
    console.log('\n>> Code --------------------------------------------------');
    console.log('\n', result.code || result);
    console.log('>> End Code ------------------------------------------------');

    console.log('\n>> Metadata --------------------------------------------------');
    console.log('\n', result.metadata);
    console.log('>> End Metadata ------------------------------------------------');
})
.catch((err) => {
    console.log(err);
});
