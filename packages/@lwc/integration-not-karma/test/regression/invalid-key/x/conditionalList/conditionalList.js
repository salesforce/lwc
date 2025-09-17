import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    show = true;
    @api items = [];
}
