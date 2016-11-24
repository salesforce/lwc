#!/usr/bin/env babel-node
/*
 * THIS IS A TEMPORAL TEST CLI
 * DON'T COMMIT CHANGES ON THIS FILE TO GIT! 
*/

import * as babel from 'babel-core';

import plugin from '../src/index';

const testSrc = `
   <template>
    <section class="section">
        <ul class="ul!!" style="font-size:12px" data-foo:bind="bar">
            <li>Header: {title}</li>
            <li class="x" repeat:for="(index, item) of items" repeat:index="index">
                <p if:bind="item.yes">{pefix} : {item.x}</p>
                <p foo:bind="r"></p>
            </li>
        </ul>
    </section>
   </template>
`;

const src = testSrc.replace(/<!--([\s\S]*?)-->/g);


const result = babel.transform(src, {
    plugins: [ plugin ]
});

console.log(result.code);