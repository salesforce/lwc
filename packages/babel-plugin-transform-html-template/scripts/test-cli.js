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
        <p if:bind="first">x</p>
        <ul>
            <li repeat:for="item of items">
                <lightning:button label="foo" other-prop:bind="second" foo:bind="third">Foo: {fourth}</lightning:button>
            </li>
        </ul>
    </section>
   </template>
`;

const src = testSrc.replace(/<!--([\s\S]*?)-->/g);


const result = babel.transform(src, {
    plugins: [ plugin ]
});

console.log('>> Metadata:\n', result.metadata.usedProps);
console.log('>> Code:\n', result.code);