import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    static observedAttributes = ['foo'];

    @api changes = [];

    attributeChangedCallback(name, oldValue, newValue) {
        this.changes.push({ name, oldValue, newValue });
    }
}
