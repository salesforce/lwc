import { Element, track } from 'engine';

export default class ChangeEventComposed extends Element {
    @track notComposed = false;
    handleChange(evt) {
        this.notComposed = evt.composed === false;
    }
}
