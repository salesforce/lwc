#!/usr/bin/env babel-node
/*
 * THIS IS A TEMPORAL TEST CLI
 * DON'T COMMIT CHANGES ON THIS FILE TO GIT! 
*/

import * as babel from 'babel-core';

import plugin from '../src/index';

const testSrc = `
<template>
    <section set:class="foo" data-foo--bar="bar" foo-x="4">
        <ns:foo>{message}</ns:foo>
        <ns-foo>{message}</ns-foo>
    </section>
</template>
`;

/*
<a style="font-size:10px" set:class="myClass.x.y" set:x="a.b" set:y="c" bind:onclick="handleClick"> </a>

 <ul>
        <li repeat:for="item of items" eval:if="item.isHidden">{item.foo}</li> 
    </ul>
*/
const src = testSrc.replace(/<!--([\s\S]*?)-->/g);

console.log('>> Source --------------------------------------------------');
console.log(src);
console.log('------------------------------------------------------------');

const result = babel.transform(src, { babelrc:false, plugins: [ plugin ] });

console.log('\n>> Code --------------------------------------------------')
console.log('\n', result.code);