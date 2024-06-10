import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'light';

    @api top = 'bottom';
    @api bottom = 'top';
}
