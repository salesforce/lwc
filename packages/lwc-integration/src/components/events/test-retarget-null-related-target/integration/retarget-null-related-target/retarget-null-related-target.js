import { LightningElement, track } from 'lwc';

export default class RetargetRelatedTarget extends LightningElement {
    @track relatedTargetIsNull;
    handleFocusIn(evt) {
        this.relatedTargetIsNull = evt.relatedTarget === null
    }
}
