#!/usr/bin/env babel-node

import * as babel from 'babel-core';
import * as fs from 'fs';

import plugin from '../src/index';

// read the filename from the command line arguments
const fileName = process.argv[2];
const src = fs.readFileSync(fileName);

const {code, metadata} = babel.transform(src, {
    plugins: [ plugin ]
});

console.log(code);