import { LightningElement, api, track } from 'lwc';

const DefaultMinValue = 5;
const DefaultMaxValue = 35;
const base = [];
for (let i = 0; i < 100; i += 1) {
    base[i] = i;
}

function produceNewData(min, max) {
    return base.slice(min, max);
}

export default class SimpleList extends LightningElement {
    normalizedMin = DefaultMinValue;
    normalizedMax = DefaultMaxValue;

    @track data = [];

    @api get min() {
        return this.normalizedMin;
    }

    set min(value) {
        this.normalizedMin = Math.max(parseInt(value, 10), 0);
        this.data = produceNewData(this.normalizedMin, this.normalizedMax);
    }

    @api get max() {
        return this.normalizedMax;
    }

    set max(value) {
        this.normalizedMax = Math.min(parseInt(value, 10), 100);
        this.data = produceNewData(this.normalizedMin, this.normalizedMax);
    }
}
