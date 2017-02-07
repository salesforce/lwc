#!/usr/bin/env babel-node
/* eslint-env node */

import {compile} from '../src/index';
import path from 'path';

const filePath = process.argv[2] || '';
const entry = path.resolve(filePath.substring(2));
const options = {};

compile(entry, options)
.then((result) => {
    console.log('\n>> Code --------------------------------------------------');
    console.log('\n', result.code);
    console.log('>> End Code ------------------------------------------------');

    console.log('\n>> Metadata --------------------------------------------------');
    console.log('\n', result.metadata);
    console.log('>> End Metadata ------------------------------------------------');
})
.catch((err) => {
    console.log(err);
});
