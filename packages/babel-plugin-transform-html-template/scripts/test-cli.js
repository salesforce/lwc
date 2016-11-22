/*
 * THIS IS A TEMPORAL TEST CLI
 * DON'T COMMIT CHANGES ON THIS FILE TO GIT! 
*/

import * as babel from 'babel-core';

import plugin from '../src/index';

const testSrc = `
    <template>
        <section data-foo="bar">
            <p class="foo" style="color:red">Test</p>
            <lightning:button label="foo" />
        </section>
    </template>
`; 

const result = babel.transform(testSrc, {
    plugins: [ plugin ]
});

console.log(result.code);