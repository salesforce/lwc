import { LightningElement } from 'lwc';

export default class extends LightningElement {
    lazyCtor;

    async connectedCallback() {
        const { default: ctor } = await import('test');
        this.lazyCtor = ctor;
    }
}