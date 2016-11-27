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
                <p if:bind="item.x">x</p> 
                <p else:bind>y</p> 
                <ns:otherWrapper c="item.literal" d:bind="otherProp.literal"> 
                    <div class="my-list" repeat:for="(innerItem, index2) of item.otherList">
                        <a:b c="innerItem.literal" d:bind="innerItem.literal" e:bind="otherProp2.literal" f:bind="item.x" >
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


const result = babel.transform(src, {
    plugins: [ plugin ]
});

console.log('>> Metadata:\n', result.metadata.usedProps);
console.log('>> Code:\n', result.code);