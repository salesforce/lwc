import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'light';

    @api showTop = false;
    @api topTop = 'top';
    @api topBottom = 'bottom';
    @api bottomTop = 'top';
    @api bottomBottom = 'bottom';
}
