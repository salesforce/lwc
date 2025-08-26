import { LightningElement, api, track } from 'lwc';

export default class Child extends LightningElement {
    @track
    privateAriaLabel = 'default';

    @api
    get ariaLabel() {
        return this.privateAriaLabel;
    }
    set ariaLabel(value) {
        this.privateAriaLabel = value;
    }
}
