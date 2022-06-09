import { api, LightningElement } from 'lwc';

export default class List extends LightningElement {
    static renderMode = 'light';
    @api items;
}
