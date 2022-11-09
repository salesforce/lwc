import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    static renderMode = 'light';
    @api
    showStandard = false;
    @api
    showVariant = false;

    slot1VariantData = { id: 1, name: 'slots and if block' };

    @api
    switchFromVariantToStandard() {
        this.showStandard = true;
        this.showVariant = false;
    }
}
