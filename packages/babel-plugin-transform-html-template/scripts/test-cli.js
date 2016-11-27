#!/usr/bin/env babel-node
/*
 * THIS IS A TEMPORAL TEST CLI
 * DON'T COMMIT CHANGES ON THIS FILE TO GIT! 
*/

import * as babel from 'babel-core';

import plugin from '../src/index';

const testSrc = `
   <template>
    <section class="section" style="margin: 10px">
        <lightning:button label="foo" other-prop="Other">Foo: {bar}</lightning:button>
    </section>
   </template>
`;

const src = testSrc.replace(/<!--([\s\S]*?)-->/g);


const result = babel.transform(src, {
    plugins: [ plugin ]
});

console.log(result.code);