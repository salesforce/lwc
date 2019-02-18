import { LightningElement, api, track } from 'lwc';

export default class LightningTab extends LightningElement {
    @track _loadContent = false;

    connectedCallback() {
        this._connected = true;

        this.dispatchEvent(
            new CustomEvent('privatetabregister', {
                cancelable: true,
                bubbles: true,
                composed: true,
            }),
        );
    }

    @api
    loadContent() {
        this._loadContent = true;
        this.dispatchEvent(new CustomEvent('active'));
    }

    disconnectedCallback() {
        this._connected = false;
    }
}
