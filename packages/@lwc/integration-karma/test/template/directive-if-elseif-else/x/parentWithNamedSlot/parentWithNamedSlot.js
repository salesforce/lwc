import { LightningElement, api } from 'lwc';

export default class ParentWithNamedSlot extends LightningElement {
    @api condition = false;
    @api nestedNamedSlot = false;
    @api nestedDefaultSlot = false;
}
