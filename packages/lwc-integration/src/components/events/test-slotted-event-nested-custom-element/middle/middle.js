import { Element, track } from 'engine';

export default class Middle extends Element {
    @track eventTagName;
    handleClick(evt) {
        this.eventTagName = evt.target.tagName;
    }
}
