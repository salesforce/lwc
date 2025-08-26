import { LightningElement, api } from 'lwc';

export default class ParentWithScopedSlot extends LightningElement {
    @api lightDomChildWithStandardSlots = false;
    @api shadowDomChildWithStandardSlots = false;
}
