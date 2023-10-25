import { LightningElement, api } from 'lwc';

export default class AdapterChild extends LightningElement {
    static renderMode = 'light';

    @api
    uuid = Math.floor(Math.random() * 1_000_000_000);

    connectedCallback() {
        console.log(`connecting component ${this.uuid}`);
    }

    disconnectedCallback() {
        console.log(`disconnecting component ${this.uuid}`);
    }
}
