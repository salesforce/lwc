/*
 * THIS IS A TEMPORAL TEST CLI
 * DON'T COMMIT CHANGES ON THIS FILE TO GIT! 
*/

import * as babel from 'babel-core';

import plugin from '../src/index';

const testSrc = '<template><p>Test</p></template>'; 

const result = babel.transform(testSrc, {
    plugins: [ plugin ]
});

console.log(result.code);