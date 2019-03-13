import { LightningElement, api } from 'lwc';
import tmpl from './reactivity.html';

export default class Reactivity extends LightningElement {
    @api nonReactive;
    @api reactive;

    renderCount = 0;

    @api
    getRenderCount() {
        return this.renderCount;
    }

    render() {
        this.renderCount++;
        return tmpl;
    }
}
