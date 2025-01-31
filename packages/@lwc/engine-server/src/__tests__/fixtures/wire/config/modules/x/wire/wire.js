import { LightningElement, wire } from 'lwc';

import { adapter } from './adapter';

const variable = 0x1134;
const echo = (v) => v;

export default class Wire extends LightningElement {
    @wire(adapter, {})
    empty;

    @wire(adapter, {
        staticIdentifier: 'regular value',
        staticLiteral: 'regular value',
        ['computed literal can be treated like static']: 'regular value',
    })
    staticPropsRegularValues;

    @wire(adapter, {
        staticIdentifier: '$dynamic.value',
        staticLiteral: '$dynamic.value',
        ['computed literal can be treated like static']: '$dynamic.value',
    })
    staticPropsDynamicValues;

    @wire(adapter, {
        [variable /* computed identifier */]: 'regular value',
        [echo('computed expression')]: 'regular value',
    })
    computedPropsRegularValues;

    @wire(adapter, {
        [variable /* computed identifier */]: '$dynamic.value',
        [echo('computed expression')]: '$dynamic.value',
    })
    computedPropsDynamicValues;

    @wire(adapter, {
        variable,
        identifier: '$dynamic.value',
        regular: 'is regular',
        string: 'regular',
        dynamic: '$dynamic.value',
        array: ['value'],
        fakeMagic: ['$cmpProp', "$ string in arrays aren't magic"],
        1.2_3e+2: true, // parsed as numeric literal, i.e. `123`
        ['computedNotDynamic']: 'hello',
        ['computedStringLiteral']: '$cmpProp',
        [555n]: '$cmpProp',
        [321]: '$cmpProp',
        [null]: '$cmpProp',
        [undefined]: '$cmpProp',
        [true ? 'yes' : 'no']: 'expression',
        [(() => 'weird IIFE')()]: 'why',
        [`template literal`]: 'fancy!',

        // methods / spread should be ignored but preserved
        get foo() {},
        set bar(v) {},
        method() {},
        ...{ spread: true },
    })
    mixedAndEdgeCases;

    dynamic = { value: 'a dynamic value' };
    cmpProp = 123;
}
