#!/usr/bin/env babel-node
/*
 * THIS IS A TEMPORAL TEST CLI
 * DON'T COMMIT CHANGES ON THIS FILE TO GIT! 
*/

import * as babel from 'babel-core';

import plugin from '../src/index';

const testSrc = `
<template>
    <section>
        <ul>
            <li repeat:for="item of items" eval:if="item.isHidden">{item.foo}</li> 
        </ul>
        <a data-foo="x" href="#" bind:onclick="handleClick"></a>
    </section>
</template>

`;
/*



*/
const src = testSrc.replace(/<!--([\s\S]*?)-->/g);

console.log('>> Source --------------------------------------------------');
console.log(src);
console.log('------------------------------------------------------------');

const result = babel.transform(src, { babelrc:false, plugins: [ plugin ] });

console.log('\n>> Code --------------------------------------------------')
console.log('\n', result.code);