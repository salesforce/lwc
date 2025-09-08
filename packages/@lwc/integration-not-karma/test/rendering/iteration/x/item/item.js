import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api first;
    @api last;
    @api index;
    @api value;
}
