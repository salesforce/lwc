import { LightningElement } from 'lwc';

export default class extends LightningElement {
    // Override reflectivity
    ariaCurrent = 'default property value for overridden ariaCurrent';

    connectedCallback() {
        this.setAttribute('aria-label', 'connectedCallback');
        this.setAttribute('aria-current', 'connectedCallback');
    }
}
