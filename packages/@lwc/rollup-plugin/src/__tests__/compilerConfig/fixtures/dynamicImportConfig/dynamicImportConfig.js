import { LightningElement } from 'lwc';

export default class extends LightningElement {
    ctor;

    async connectedCallback() {
        this.ctor = await import('test');
    }
}