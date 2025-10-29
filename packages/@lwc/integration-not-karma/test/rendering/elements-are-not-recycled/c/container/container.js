import { LightningElement, api } from 'lwc';

export default class Container extends LightningElement {
    @api isCustomElement = false;
    @api isElement = false;
    @api isStyleCheck = false;

    dispatchHandlerCalledEvent() {
        this.dispatchEvent(new CustomEvent('handlercalled'));
    }
}
