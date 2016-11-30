#!/usr/bin/env babel-node
/*
 * THIS IS A TEMPORAL TEST CLI
 * DON'T COMMIT CHANGES ON THIS FILE TO GIT! 
*/

import * as babel from 'babel-core';

import plugin from '../src/index';

const testSrc = `
   <template>
    <section class="bar">
        <ul class="my-list">
            <a:b>first</a:b>
            <li class="item" repeat:for="item of items">
                {item}
            </li>
            {last}
        </ul>
    </section>
</template>


`;

const src = testSrc.replace(/<!--([\s\S]*?)-->/g);

const result = babel.transform(src, { babelrc:false, plugins: [ plugin ] });
console.log('>> Code:\n', result.code);