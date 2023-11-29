import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api
    upperSlot = 'upper';

    @api
    lowerSlot = 'lower';

    @api
    defaultSlot = '';

    @api
    get leaf() {
        return this.template.querySelector('x-light-leaf');
    }
}
