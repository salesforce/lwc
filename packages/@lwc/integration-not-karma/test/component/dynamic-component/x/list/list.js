import { LightningElement, api, track } from 'lwc';
import Foo from 'x/foo';
import Bar from 'x/bar';
import Baz from 'x/baz';
import Fred from 'x/fred';

export default class extends LightningElement {
    @track
    items = [
        { key: 2, ctor: Foo },
        { key: 4, ctor: Bar },
        { key: 1, ctor: Baz },
        { key: 3, ctor: Fred },
    ];

    @api
    swapConstructors() {
        this.items[0].ctor = Baz;
        this.items[1].ctor = Fred;
        this.items[2].ctor = Foo;
        this.items[3].ctor = Bar;
    }

    @api
    removeConstructors() {
        this.items[0].ctor = null;
        this.items[2].ctor = null;
    }
}
