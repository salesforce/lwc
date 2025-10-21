import { LightningElement, track } from 'lwc';

export default class RetargetBodyRelatedTarget extends LightningElement {
    @track relatedTargetTagName;
    connectedCallback() {
        document.body.tabIndex = 0;
    }
    handleFocusIn(evt) {
        this.relatedTargetTagName = evt.relatedTarget.tagName.toLowerCase();
    }
}
