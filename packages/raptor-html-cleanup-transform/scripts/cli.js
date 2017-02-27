#!/usr/bin/env node
/* eslint-env node */
const parser = require('../src/index');
const fs = require('fs');
const path = require('path');

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
        const src = file;
        console.log('>> Source --------------------------------------------------');
        console.log(src);
        console.log('>> End Source ----------------------------------------------');

        parser.transform(src)
        .then(result => {
            console.log('\n>> Code --------------------------------------------------');
            console.log('\n', result);
            console.log('>> End Code ------------------------------------------------');
        })
        .catch(error => {
            console.log(error);
        });
    }
