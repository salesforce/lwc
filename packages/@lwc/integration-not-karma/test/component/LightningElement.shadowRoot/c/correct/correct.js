import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api
    get shadowRoot() {
        return (this._shadowRoot =
            this._shadowRoot || document.body.appendChild(document.createElement('p')));
    }
}
