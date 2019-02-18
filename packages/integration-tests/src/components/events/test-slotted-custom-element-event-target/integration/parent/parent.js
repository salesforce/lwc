import { LightningElement, track } from 'lwc';

export default class XParent extends LightningElement {
    @track eventTargetIsCorrectTag = false;
    handleClick(evt) {
        this.eventTargetIsCorrectTag = evt.target.tagName === 'INTEGRATION-CHILD';
    }
}
