#!/usr/bin/env babel-node
import * as fs from 'fs';

import {compile} from '../src/index';
import path from 'path';

const options = {
    sourceTemplate : `
        <template>
            <section>
                <p>{test}</p>
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
    componentBundle: true,
};

const entry = 'foo.js';

compile(entry, options)
.then((res) => {
    console.log(res.code);
})
.catch((err) => {
    console.log(err);
});