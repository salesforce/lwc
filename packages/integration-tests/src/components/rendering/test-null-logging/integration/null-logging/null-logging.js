import { LightningElement, track } from 'lwc';

export default class ReactiveObjectLog extends LightningElement {
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
