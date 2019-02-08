import { LightningElement, api } from 'lwc';

export default class Test extends LightningElement {
    @api listener;

    connectedCallback() {
        this.addEventListener('click', this.listener);
    }

    @api
    removeListener() {
        this.removeEventListener('click', this.listener);
    }
}
