import { LightningElement, track } from 'lwc';

export default class Parent extends LightningElement {
    @track relatedTargetTagname;

    handleFocusIn(evt) {
        this.relatedTargetTagname = evt.relatedTarget.tagName.toLowerCase();
    }
}
