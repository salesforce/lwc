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

const src = testSrc.replace(/<!--([\s\S]*?)-->/g);

console.log('>> Source --------------------------------------------------');
console.log(src);
console.log('>> End Source ----------------------------------------------');

const result = babel.transform(src, { babelrc:false, plugins: [ plugin ] });

console.log('\n>> Code --------------------------------------------------');
console.log('\n', result.code);
console.log('>> End Code ------------------------------------------------');


console.log('\n>> Metadata --------------------------------------------------');
console.log('\n', result.metadata);
console.log('>> End Metadata ------------------------------------------------');