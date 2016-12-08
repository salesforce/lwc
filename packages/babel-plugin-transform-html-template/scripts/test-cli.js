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
        <ns:outerItem class="" repeat:for="(item, index) of items">
            <div class="wrapper">
                <p eval:if="item.x">x</p> 
                <p eval:else>x</p> 
                <ns:otherWrapper c="item.literal" bind:d="otherProp.literal"> 
                    <div class="my-list" repeat:for="(innerItem, index2) of item.otherList">
                        <a:b c="innerItem.literal" bind:d="innerItem.literal" bind:e="otherProp2.literal" bind:f="item.x" >
                            {item} {item.foo} {innerItem.x} {nonScoped.bar} {foo} {Math.random()}
                        </a:b>  
                    </div>
                </ns:otherWrapper>
            </div>
        </ns:outerItem>
    </section>
</template>
`;

const src = testSrc.replace(/<!--([\s\S]*?)-->/g);

console.log('>> Source --------------------------------------------------');
console.log(src);
console.log('------------------------------------------------------------');

const result = babel.transform(src, { babelrc:false, plugins: [ plugin ] });

console.log('\n>> Code --------------------------------------------------')
console.log('\n', result.code);