import { api, LightningElement } from 'lwc';
import Foo from 'x/foo';
import Bar from 'x/bar';
import Baz from 'x/baz';

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
