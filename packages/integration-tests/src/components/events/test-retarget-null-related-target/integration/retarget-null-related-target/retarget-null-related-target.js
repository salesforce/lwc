import { LightningElement, track } from 'lwc';

export default class RetargetRelatedTarget extends LightningElement {
    @track relatedTargetIsNull;
    handleFocus(evt) {
        this.relatedTargetIsNull = evt.relatedTarget === null;
    }
}
