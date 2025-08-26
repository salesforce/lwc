import { LightningElement } from 'lwc';
import Foo from 'x/foo';
import Bar from 'x/bar';
import Fred from 'x/fred';

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
