import { LightningElement, track } from 'lwc';

export default class MyComponent extends LightningElement {
    @track
    state = {};
    connectedCallback() {
        this.state.foo = null;
        // Testing the getter; don't need to use the return value
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.state.foo;
    }
}
