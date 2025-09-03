import { LightningElement, track } from 'lwc';

export default class Container extends LightningElement {
    @track foo = null;
    @track errorMessage;
    connectedCallback() {
        try {
            // Testing the getter; don't need to use the return value
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            this.foo;
        } catch (e) {
            this.errorMessage = e.message;
        }
    }
}
