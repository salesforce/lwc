import { LightningElement, api } from 'lwc';
import Parent from 'x/slottable';
import Foo from 'x/foo';

export default class extends LightningElement {
    parentCtor;
    childCtor;

    @api
    loadParent() {
        this.parentCtor = Parent;
    }

    @api
    loadChild() {
        this.childCtor = Foo;
    }
}
