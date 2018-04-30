import { Element, track } from 'engine';

export default class Issue791 extends Element {
    @track radioButtonValue;

    handleChange(e) {
        this.radioButtonValue = e.target.value;
    }
}
