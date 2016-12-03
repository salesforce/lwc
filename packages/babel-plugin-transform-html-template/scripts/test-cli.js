#!/usr/bin/env babel-node
/*
 * THIS IS A TEMPORAL TEST CLI
 * DON'T COMMIT CHANGES ON THIS FILE TO GIT! 
*/

import * as babel from 'babel-core';

import plugin from '../src/index';

const testSrc = `
   <template>
    <section assign:class="bar">
        <p assign:if="cond1">Yay!</p>
        <p assign:else>Yayelse</p>

        <ul>
           <li>first</li>
            <li repeat:for="item of items">
                <p assign:class="item">{item}</p>
            </li>
        </ul>
        <div class="my-list">
            <a:b assign:prop-test="val1">first</a:b>
            <button assign:label="label" bind:onclick="onClick" bind:ondblclick="onDoubleClick">{expchild}</button>
        </div>
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