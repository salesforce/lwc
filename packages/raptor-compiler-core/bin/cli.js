#!/usr/bin/env babel-node
import * as fs from 'fs';

import {compile} from '../src/index';
import path from 'path';

const options = {
    sourceTemplate : `
        <template>
            <section>
                <a:b><a bind:onclick="handleClick">{test}</a></a:b>
            </section>
        </template>
    `,
    sourceClass: `
        export default class Foo {
            test = 'foo';
            static tagName = 1;
            constructor() {}
        }
    `,
    sourceCSS: '',

    format: 'amd',
};

const entry = '/ns/foo/foo.js';

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
