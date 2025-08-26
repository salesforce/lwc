import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api signal;
    items = [1, 2, 3, 4, 5, 6];
}
