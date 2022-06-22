import { LightningElement, track } from 'lwc';

export default class Container extends LightningElement {
    @track foo = null;
    @track errorMessage;
    connectedCallback() {
        try {
            this.foo;
        } catch (e) {
            this.errorMessage = e.message;
        }
    }
}
