import { Element } from 'engine';

const DefaultMinValue = 5;
const DefaultMaxValue = 35;

function produceNewData(oldData, min, max) {
    const len = Math.floor(Math.random() * (max - min)) + min;
    const data = [];
    for (let i = 0; i < len; i += 1) {
        if (Math.round(Math.random()) === 1 && oldData[i]) {
            data.push(oldData[i]);
        } else {
            data.push({ x: Math.floor(Math.random() * 100) });
        }
    }
    return data;
}

export default class SimpleList extends Element {
    normalizedMin = DefaultMinValue;
    normalizedMax = DefaultMaxValue;

    @track data = [];

    @api get min() {
        return this.normalizedMin;
    }

    @api set min(value) {
        this.normalizedMin = parseInt(value, 10);
        this.data = produceNewData(this.data, this.min, this.max);
    }

    @api get max() {
        return this.normalizedMax;
    }

    @api set max(value) {
        this.normalizedMax = parseInt(value, 10);
        this.data = produceNewData(this.data, this.min, this.max);
    }

    @api reshuffle() {
        const newData = produceNewData(this.data, this.min, this.max);
        this.data = newData;
    }
}
