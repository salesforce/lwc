import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api checked;
    @api value;
    @api disabled;
}
