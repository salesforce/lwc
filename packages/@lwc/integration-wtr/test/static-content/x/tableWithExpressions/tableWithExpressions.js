import { LightningElement } from 'lwc';

export default class extends LightningElement {
    rows = [
        {
            id: 0,
            style: 'color: 0;',
            class: 'class0',
            value: 'value0',
        },
        {
            id: 1,
            style: 'color: 1;',
            class: 'class1',
            value: 'value1',
        },
        {
            id: 2,
            style: 'color: 2;',
            class: 'class2',
            value: 'value2',
        },
    ];
}
