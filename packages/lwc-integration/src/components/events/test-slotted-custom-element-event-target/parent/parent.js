import { Element, track } from 'engine';

export default class XParent extends Element {
    @track eventTargetIsCorrectTag = false;
    @track eventTargetTagName;
    handleClick(evt) {
        this.eventTargetTagName = event.target.tagName;
        this.eventTargetIsCorrectTag = evt.target.tagName === 'X-CHILD';
    }
}
