import { LightningElement } from 'lwc';

export default class extends LightningElement {
    get ariaDescription() {
        return this.__ariaDescription;
    }
    set ariaDescription(value) {
        this.__ariaDescription = value;
    }

    connectedCallback() {
        this.ariaLabel = 'dynamically set by child';
        this.ariaDescription = 'dynamically set by child';
    }
}