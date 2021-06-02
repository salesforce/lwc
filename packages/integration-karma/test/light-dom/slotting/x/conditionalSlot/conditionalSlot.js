import { LightningElement } from 'lwc';

export default class ConditionalSlot extends LightningElement {
    static renderMode = 'light';
    showSlot = true;

    toggleSlot() {
        this.showSlot = !this.showSlot;
    }
}
