import { LightningElement, api } from 'lwc';

export default class Container extends LightningElement {
    _connected = [];
    _rendered = [];

    @api
    getConnectedClassNames() {
        return this._connected;
    }

    @api
    getRenderedClassNames() {
        return this._rendered;
    }

    constructor() {
        super();
        this.template.addEventListener('connected', event => {
            this._connected = [...this._connected, event.detail.className];
        });
        this.template.addEventListener('rendered', event => {
            this._rendered = [...this._rendered, event.detail.className];
        });
    }
}
