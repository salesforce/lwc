import { Element, track } from 'engine';

export default class Child extends Element {
    @track eventTargetIsPTag = false;
    handleClick(evt) {
        this.eventTargetIsPTag = evt.target.tagName === 'P';
    }
}
