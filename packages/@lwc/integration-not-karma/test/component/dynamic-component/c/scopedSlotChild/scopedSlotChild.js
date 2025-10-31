import { LightningElement } from 'lwc';
import Foo from 'c/foo';
import Bar from 'c/bar';
import Fred from 'c/fred';

export default class extends LightningElement {
    static renderMode = 'light';
    slotData;

    connectedCallback() {
        this.slotData = [
            { key: 0, ctor: Foo },
            { key: 1, ctor: Bar },
            { key: 2, ctor: Fred },
        ];
    }
}
