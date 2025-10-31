import { LightningElement, api } from 'lwc';
import Foo from 'c/foo';
import Bar from 'c/bar';

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
