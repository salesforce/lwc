#!/usr/bin/env babel-node
import * as fs from 'fs';

import {compile} from '../src/index';
import path from 'path';

const options = {
    sourceTemplate : `
        <template>
            <section>
                <a:b>{test}</a:b>
            </section>
        </template>
    `, 
    sourceClass: `
        export default class Foo {
            test = 'foo';
            constructor() {}
        }
    `,
    sourceCSS: '',

    sources: {
        'foo.html': `<template><section><p>{test}</p></section></template>`,
        'foo.js': `export default class Foo { test = 'foo'; constructor() {}}`,
    },
    format: 'amd'
};

const entry = 'foo.js';

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