import { LightningElement } from 'lwc';

export default class extends LightningElement {
    connectedCallback() {
        this.dispatchEvent(
            new CustomEvent('customconnected', {
                bubbles: true,
                composed: true,
            })
        );
    }

    disconnectedCallback() {
        this.dispatchEvent(
            new CustomEvent('customdisconnected', {
                bubbles: true,
                composed: true,
            })
        );
    }
}
