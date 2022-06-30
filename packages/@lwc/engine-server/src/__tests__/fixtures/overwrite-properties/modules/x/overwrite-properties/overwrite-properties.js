import { LightningElement, api } from 'lwc';

export default class Cmp extends LightningElement {
    @api name;
    @api type;
    @api value;
}