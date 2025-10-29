import { LightningElement, api } from 'lwc';
import Parent from 'c/slottable';
import Foo from 'c/foo';

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
