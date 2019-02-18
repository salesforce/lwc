import { LightningElement, api } from 'lwc';

export default class RecordLayoutLeaf extends LightningElement {
    @api label;
    @api value;
    @api displayValue;
    @api fieldApiName;
}
