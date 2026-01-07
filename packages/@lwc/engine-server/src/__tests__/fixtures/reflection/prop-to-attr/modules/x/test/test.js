import { LightningElement } from 'lwc';

export default class extends LightningElement {
    // Override reflectivity
    ariaCurrent = 'default property value for overridden ariaCurrent';

    connectedCallback() {
        this.ariaLabel = 'connectedCallback';
        this.ariaCurrent = 'connectedCallback';
    }
}
