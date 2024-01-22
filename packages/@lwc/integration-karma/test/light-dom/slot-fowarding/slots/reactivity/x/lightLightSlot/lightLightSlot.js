import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'light';

    @api
    upperSlot = 'upper';

    @api
    lowerSlot = 'lower';

    @api
    defaultSlot = '';

    @api
    get leaf() {
        return this.querySelector('x-light-leaf');
    }
}
