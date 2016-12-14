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

export default class SimpleList {
    min = DefaultMinValue;
    max = DefaultMaxValue;
    label = 'default label';
    title = 'default title';

    constructor() {
        this.counter = 0;
        this.itemClassName = 'item';
        this.data = [];
    }

    static get observedAttributes() {
        return ['min', 'max'];
    }

    attributeChangedCallback() {
        this.data = produceNewData(this.data, this.min, this.max);
    }

    handleClick() {
        this.counter += 1;
        const newData = produceNewData(this.data, this.min, this.max);
        this.data = newData;
        console.log('clicked');
    }
}