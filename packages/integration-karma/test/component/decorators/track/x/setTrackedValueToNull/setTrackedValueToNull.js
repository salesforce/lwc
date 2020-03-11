import { LightningElement, track } from 'lwc';

export default class MyComponent extends LightningElement {
    @track
    state = {};
    connectedCallback() {
        this.state.foo = null;
        this.state.foo;
    }
}
