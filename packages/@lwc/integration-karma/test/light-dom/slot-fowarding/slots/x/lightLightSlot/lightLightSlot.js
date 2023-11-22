import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'light';

    @api
    dynamicSlotAssignment = 'dynamicSlot';

    @api
    assignDefaultSlotUsingVariable = false;

    defaultSlotReassignment = 'default-slot-reassigned';
}
