import { LightningElement, api } from 'lwc';

export default class Test extends LightningElement {
    @api disconnect;

    disconnectedCallback() {
        if (this.disconnect) {
            this.disconnect(this);
        }
    }
}
