import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    @api
    showStandard = false;

    @api
    showVariant = false;
}
