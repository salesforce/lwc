import { LightningElement, api } from 'lwc';

export default class LightningTabset extends LightningElement {
    _registered = 0;

    handleTabRegister(event) {
        event.stopPropagation();
        const tab = event.target;
        this._registered++;
        tab.loadContent();
    }

    @api getRegistered() {
        return this._registered;
    }
}
