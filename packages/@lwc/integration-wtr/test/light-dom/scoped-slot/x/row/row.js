import { LightningElement, api } from 'lwc';

export default class row extends LightningElement {
    static renderMode = 'light';
    @api
    row;
}
