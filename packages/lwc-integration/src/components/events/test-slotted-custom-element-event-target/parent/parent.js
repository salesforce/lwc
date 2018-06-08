import { Element, track } from 'engine';

export default class XParent extends Element {
    @track eventTargetIsCorrectTag = false;
    handleClick(evt) {
        this.eventTargetIsCorrectTag = evt.target.tagName === 'X-CHILD';
    }
}
