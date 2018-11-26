import { LightningElement, track } from 'lwc';

export default class RetargetRelatedTarget extends LightningElement {
    @track relatedTargetTagName;
    handleFocusIn(evt) {
        this.relatedTargetTagName = evt.relatedTarget.tagName.toLowerCase();
    }
}
