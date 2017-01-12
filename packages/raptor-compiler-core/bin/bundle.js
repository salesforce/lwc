#!/usr/bin/env babel-node
import * as fs from 'fs';
import {compile} from '../src/index';
import path from 'path';

const entry = path.resolve(__dirname + '/../test/fixtures/bundle/simpleClass1.js');

compile(entry, { componentNamespace: 'test' })
.then((res) => {
    console.log(res.code);
})
.catch((err) => {
    console.log(err);
});