import { LightningElement, api } from 'lwc';
import Foo from 'x/foo';
import Bar from 'x/bar';

export default class extends LightningElement {
    ctor;

    @api
    loadFoo() {
        this.ctor = Foo;
    }

    @api
    loadBar() {
        this.ctor = Bar;
    }

    @api
    clearCtor() {
        this.ctor = null;
    }
}
