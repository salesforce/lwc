#!/usr/bin/env babel-node
import * as fs from 'fs';

import {compile} from '../src/index';
import path from 'path';


const TEST_SRCS = {
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
    sourceCSS: ''
};

const config = Object.assign(TEST_SRCS, {
    componentPath: 'ns/foo/foo.js',
});

compile(config)
.then((res) => {
    console.log(res.code);
})
.catch((err) => {
    console.log(err);
});