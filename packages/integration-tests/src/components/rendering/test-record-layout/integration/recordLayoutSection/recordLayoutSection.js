import { LightningElement, api } from 'lwc';

export default class RecordLayoutSection extends LightningElement {
    @api mode;
    @api titleLabel;
    @api recordId;
}
