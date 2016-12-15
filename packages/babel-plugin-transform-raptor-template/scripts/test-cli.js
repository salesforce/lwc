#!/usr/bin/env babel-node
/*
 * THIS IS A TEMPORAL TEST CLI
 * DON'T COMMIT CHANGES ON THIS FILE TO GIT! 
*/

import * as babel from 'babel-core';

import plugin from '../src/index';

const testSrc = `
<template>
    <div class="foo">
        <h1 eval:if="title">{title}</h1>
        <ul class="foo">
            <li class="first">header</li>
            <li repeat:for="item of data" set:class="itemClassName">
                Value of X = {item.x}
            </li> 
            <li class="last">footer</li>
        </ul>
        <button bind:onclick="handleClick">{label}</button>
    </div>
</template>

`;

const src = testSrc.replace(/<!--([\s\S]*?)-->/g);

console.log('>> Source --------------------------------------------------');
console.log(src);
console.log('------------------------------------------------------------');

const result = babel.transform(src, { babelrc:false, plugins: [ plugin ] });

console.log('\n>> Code --------------------------------------------------')
console.log('\n', result.code);