import { Element, track } from 'engine';

export default class SlottedEventTarget extends Element {
    @track targetIsSelect = false;
    handleChange(evt) {
        this.targetIsSelect = evt.target.tagName.toLowerCase() === 'select';
    }
}
