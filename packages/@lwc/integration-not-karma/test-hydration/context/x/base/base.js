import { LightningElement, api } from 'lwc';

export default class Base extends LightningElement {
    @api disconnect;

    disconnectedCallback() {
        if (this.disconnect) {
            this.disconnect();
        }
    }
}
