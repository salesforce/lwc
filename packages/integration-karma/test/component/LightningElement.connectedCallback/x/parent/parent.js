import { LightningElement, api } from 'lwc';

export default class SlottedParent extends LightningElement {
    @api connect;

    connectedCallback() {
        this.connect();
    }
}
