#!/usr/bin/env babel-node
/* eslint-env node */
import * as babel from 'babel-core';
import plugin from '../src/index';
import fs from 'fs';
import path from 'path';

let file;
const filePath = process.argv[2] || '';
const absPath = path.resolve(filePath.substring(2));
console.log('Reading:', absPath, '\n\n');
    try {
        file = fs.readFileSync(absPath).toString();
    } catch (e) {
        console.log('ERROR reading file');
        console.log('Usage: template-cli -- --file/path/here.js');
    }

    if (file) {
        const src = file.replace(/<!--([\s\S]*?)-->/g);

        console.log('>> Source --------------------------------------------------');
        console.log(src);
        console.log('>> End Source ----------------------------------------------');

        const result = babel.transform(src, { babelrc:false, plugins: [ plugin ] });

        console.log('\n>> Code --------------------------------------------------');
        console.log('\n', result.code);
        console.log('>> End Code ------------------------------------------------');


        console.log('\n>> Metadata --------------------------------------------------');
        console.log('\n', result.metadata);
        console.log('>> End Metadata ------------------------------------------------');
    }
