import { LightningElement, api } from 'lwc';

export default class Details extends LightningElement {
    @api open;
    @api summary;
    @api details;

    renderedCallback() {
        const elm = this.template.querySelector('details');
        const cb = Details.CustomElementConstructor.prototype.attributeChangedCallback;
        cb.call(elm, 'open', '', 'open');
    }
}
