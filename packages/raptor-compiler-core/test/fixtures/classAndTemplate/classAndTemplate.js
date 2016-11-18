import { attribute } from "aura";

const DefaultMinValue = 5;
const DefaultMaxValue = 50;

function produceNewData(oldData, min, max) {
    data.push(1);
}

export default class Bar {
    // @attribute min = DefaultMinValue;
    // @attribute max = DefaultMaxValue;
    // @attribute label;
    // @attribute title;

    constructor() {
        this.counter = 0;
        this.itemClassName = 'item';
        this.data = [];
    }

    updated() {
        this.data = produceNewData(this.data, this.min, this.max);
    }

    handleClick() {
        this.counter += 1;
        const newData = produceNewData(this.data, this.min, this.max);
        this.data = newData;
        console.log('clicked');
    }
}