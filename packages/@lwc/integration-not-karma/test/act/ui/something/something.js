import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api mode;
    @api propWithDash;
    @api fieldLabel;
    @api trueAttr;
    @api camelCase;
    @api text;
}
