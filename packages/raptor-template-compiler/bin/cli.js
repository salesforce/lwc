#!/usr/bin/env babel-node

import * as fs from 'fs';

import {compile} from '../src/index';

const fileName = process.argv[2];
const src = fs.readFileSync(fileName);

const result = compile(src);

console.log(result.code);
