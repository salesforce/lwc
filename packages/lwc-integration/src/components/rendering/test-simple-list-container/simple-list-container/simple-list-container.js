import { Element, api, track } from 'engine';

export default class SimpleListContainer extends Element {
    @api label = 'default label';
    @api header = 'default header';
    @track min = 20;
    @track max = 35;

    handleClick() {
        this.min = Math.floor(Math.random() * 100);
        this.max = Math.floor(Math.random() * (100 - this.min)) + this.min;
    }

    onMinChange(event) {
        this.min = event.target.value;
    }

    onMaxChange(event) {
        this.max = event.target.value;
    }
}
