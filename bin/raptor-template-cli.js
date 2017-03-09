#!/usr/bin/env babel-node
/* eslint-env node */
import { transform } from 'babel-core';
import plugin from '../packages/babel-plugin-transform-raptor-template/src/index.js';
import fs from 'fs';
import path from 'path';

let file;
const filePath = process.argv[2] || '';
const absPath = path.resolve(filePath);
console.log('Reading:', absPath, '\n\n');
    try {
        file = fs.readFileSync(absPath).toString();
    } catch (e) {
        console.log('ERROR reading file');
        console.log('Usage: template file/path/here.js');
    }

    if (file) {
        const src = file.replace(/<!--([\s\S]*?)-->/g);

        console.log('>> Source --------------------------------------------------');
        console.log(src);
        console.log('>> End Source ----------------------------------------------');

        const result = transform(src, { babelrc:false, plugins: [ plugin ] });

        console.log('\n>> Code --------------------------------------------------');
        console.log('\n', result.code);
        console.log('>> End Code ------------------------------------------------');


        console.log('\n>> Metadata --------------------------------------------------');
        console.log('\n', result.metadata);
        console.log('>> End Metadata ------------------------------------------------');
    }
