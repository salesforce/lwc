import { LightningElement, api, track } from 'lwc';

export default class SimpleListContainer extends LightningElement {
    @api label = 'default label';
    @api header = 'default header';
    @track min = 20;
    @track max = 35;

    handleClick() {
        this.min = Math.floor(Math.random() * 100);
        this.max = Math.floor(Math.random() * (100 - this.min)) + this.min;
    }

    handleRangeChange() {
        this.min = 1;
        this.max = 10;
    }

    onMinChange(event) {
        this.min = event.target.value;
    }

    onMaxChange(event) {
        this.max = event.target.value;
    }
}
