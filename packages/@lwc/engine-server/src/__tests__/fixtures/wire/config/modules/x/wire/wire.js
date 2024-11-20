import { LightningElement, wire } from 'lwc';

import { adapter } from './adapter';

const variable = 0x1134

export default class Wire extends LightningElement {
    @wire(adapter, {
        variable,
        prop: 'not magic',
        magic: '$cmpProp',
        array: ['value'],
        fakeMagic: ['$cmpProp', "$ string in arrays aren't magic"],
        true: true,
        false: false,
        0: 0,
        null: null,
        undefined: undefined,
        Infinity: Infinity,
        NaN: NaN,
        '': '',
        why(){}
    })
    wiredProp;

    cmpProp = 123;
}