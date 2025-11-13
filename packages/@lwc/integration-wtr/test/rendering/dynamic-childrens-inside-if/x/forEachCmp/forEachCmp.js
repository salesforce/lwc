import { LightningElement } from 'lwc';

export default class ForEachCmp extends LightningElement {
    items = [
        { id: 1, name: 'item 1' },
        { id: 2, name: 'item 2' },
    ];
    sectionOpen = false;

    toggleSection() {
        this.sectionOpen = !this.sectionOpen;
    }
}
