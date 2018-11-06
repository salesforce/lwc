import { LightningElement, track } from 'lwc';

export default class JSONStringifyShadowRoot extends LightningElement {
    @track errorMessage = 'no error';
    connectedCallback() {
        try {
            JSON.stringify(this.template);
        } catch (e) {
            this.errorMessage = e.message;
        }
    }
}
