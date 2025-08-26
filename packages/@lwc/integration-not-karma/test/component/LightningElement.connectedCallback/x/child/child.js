import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    @api
    dispatchEventOnHost() {
        const e = new CustomEvent('cstm', { bubbles: true, composed: true });
        this.dispatchEvent(e);
    }
}
