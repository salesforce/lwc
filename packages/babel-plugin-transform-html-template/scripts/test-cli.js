/*
 * THIS IS A TEMPORAL TEST CLI
 * DON'T COMMIT CHANGES ON THIS FILE TO GIT! 
*/

import * as babel from 'babel-core';

import plugin from '../src/index';

const testSrc = `
   <template>
    <section class:bind="computeMyClass">

         <!-- conditional (binded by default) -->
        <p if:true="test">True</p>

         <!-- Negation condition the idea is compile both in a ternary operator -->
        <p if:false="test">False</p> 

        <!-- For loop -->
        <ul repeat:for="(index, item) of items">
             <!-- Bind to a function (should be memoizable) -->
            <p label:bind="publicComputeLabel(index)"></p>
        </ul>

          <!-- Binding callback -->
        <lightning:button label="btn1" press:bind="pressCallback" />

        <!-- We want to fail here?, we shouldn't allow empty functions in favor of getters -->
        <lightning:button label:bind="publicComputeLabel()" press:bind="pressCallback" />
    </section>
</template>
`;

const src = testSrc.replace(/<!--([\s\S]*?)-->/g);


const result = babel.transform(src, {
    plugins: [ plugin ]
});

console.log(result.code);