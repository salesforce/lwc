import { LightningElement, track } from 'lwc';

export default class NestedTemplateEventTarget extends LightningElement {
    @track
    evtTargetIsXChild = false;

    handleFoo(evt) {
        this.evtTargetIsXChild = evt.target.tagName.toLowerCase() === 'integration-child';
    }
}
