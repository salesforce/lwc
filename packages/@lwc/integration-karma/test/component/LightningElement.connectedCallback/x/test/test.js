import { LightningElement, api } from 'lwc';

export default class Test extends LightningElement {
    @api connect;

    connectedCallback() {
        this.connect(this);
    }
}
