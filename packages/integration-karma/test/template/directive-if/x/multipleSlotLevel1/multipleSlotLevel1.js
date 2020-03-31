import { LightningElement, api } from 'lwc';

export default class MultipleSlotLevel1 extends LightningElement {
    visible = false;

    @api
    toggle() {
        this.visible = !this.visible;
    }
}
