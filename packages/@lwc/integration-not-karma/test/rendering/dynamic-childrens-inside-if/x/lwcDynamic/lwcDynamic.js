import { LightningElement } from 'lwc';

export default class LwcDynamic extends LightningElement {
    sectionOpen = false;

    toggleSection() {
        this.sectionOpen = !this.sectionOpen;
    }
}
