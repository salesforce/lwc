import { LightningElement, track } from 'lwc';

export default class Container extends LightningElement {
    @track
    evtTargetIsXChild = false;

    handleFoo(evt) {
        this.evtTargetIsXChild = evt.target.tagName.toLowerCase() === 'x-child';
    }
}
