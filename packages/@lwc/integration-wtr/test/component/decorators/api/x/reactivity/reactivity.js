import { LightningElement, api } from 'lwc';

export default class Reactivity extends LightningElement {
    @api nonReactive;
    @api reactive;

    renderCount = 0;

    @api
    getRenderCount() {
        return this.renderCount;
    }

    renderedCallback() {
        this.renderCount++;
    }
}
