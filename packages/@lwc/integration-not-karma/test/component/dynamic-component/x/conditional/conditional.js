import { api, LightningElement } from 'lwc';
import Foo from 'c/foo';
import Bar from 'c/bar';
import Baz from 'c/baz';

export default class extends LightningElement {
    ifCtor;
    elseIfCtor;
    elseCtor;

    @api
    showIf = false;

    @api
    showElseIf = false;

    @api
    setIfCtor() {
        this.ifCtor = Foo;
    }

    @api
    setElseIfCtor() {
        this.elseIfCtor = Bar;
    }

    @api
    setElseCtor() {
        this.elseCtor = Baz;
    }
}
