import { LightningElement } from 'lwc';

export default class ConditionalSlot extends LightningElement {
    static shadow = false;
    showSlot = true;

    toggleSlot() {
        this.showSlot = !this.showSlot;
    }
}
