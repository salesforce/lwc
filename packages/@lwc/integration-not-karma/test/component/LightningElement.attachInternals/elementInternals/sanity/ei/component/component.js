import { LightningElement, api } from 'lwc';
import { ariaProperties } from 'test-utils';

export default class extends LightningElement {
    @api
    internals;

    @api
    template;

    connectedCallback() {
        this.internals = this.attachInternals();
        this.template = super.template;
    }

    @api
    setAllAriaProps(value) {
        for (const prop of ariaProperties) {
            this.internals[prop] = value;
        }
    }
}
