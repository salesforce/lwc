import { LightningElement, api, track } from 'lwc';

export default class Child extends LightningElement {
    @track
    privateTabIndex = null;

    @api
    set tabIndex(value) {
        this.privateTabIndex = value;
    }
    get tabIndex() {
        return this.privateTabIndex;
    }
}
