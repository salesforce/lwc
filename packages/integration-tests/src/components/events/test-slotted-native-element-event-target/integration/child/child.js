import { LightningElement, track } from 'lwc';

export default class Child extends LightningElement {
    @track eventTargetIsPTag = false;
    handleClick(evt) {
        this.eventTargetIsPTag = evt.target.tagName === 'P';
    }
}
