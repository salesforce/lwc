import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api emptyString = '';
    @api dynamicText = 'default';
    @api siblingDynamicText = 'second default';
}
