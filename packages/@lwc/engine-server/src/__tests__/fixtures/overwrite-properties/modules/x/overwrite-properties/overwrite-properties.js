import { LightningElement, api } from 'lwc';

export default class Cmp extends LightningElement {
    @api name;
    @api namespace;
    @api type;
    @api parent;
    @api value;
    @api eventListeners;
}