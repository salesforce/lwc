import { LightningElement, track, api } from 'lwc';

export default class MyComponent extends LightningElement {
    @track
    state = {};

    @api
    set foo(value) {
        this.state.foo = value;
    }
    get foo() {
        return this.state.foo;
    }
}
