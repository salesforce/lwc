import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api loaded = false;

    loadHandler() {
        this.loaded = true;
    }
}
