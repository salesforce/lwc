#!/usr/bin/env babel-node
import * as fs from 'fs';
import {compile} from '../src/index';
import path from 'path';

const entry = path.resolve(__dirname + '/../test/fixtures/bundle/app.js');

compile(entry, { componentNamespace: 'test', componentBundle: true })
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