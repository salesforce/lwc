import { Element } from 'engine';

export default class RecordLayoutItem extends Element {
    @api mode;
    @api fieldLabel;
    @api fieldApiName;
    @api isInlineEditable = false;
}