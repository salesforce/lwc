import { LightningElement, api } from 'lwc';

export default class table extends LightningElement {
    static renderMode = 'light';
    @api
    items;
}
