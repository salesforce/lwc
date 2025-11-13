import { LightningElement } from 'lwc';

export default class extends LightningElement {
    sectionOpen = false;

    toggleSection() {
        this.sectionOpen = !this.sectionOpen;
    }
}
