const DefaultMinValue = 5;
const DefaultMaxValue = 50;

function produceNewData(oldData, min, max) {
    const len = Math.floor(Math.random() * (max - min)) + min;
    const data = [];
    for (let i = 0; i < len; i += 1) {
        if (Math.round(Math.random()) === 1 && oldData[i]) {
            data.push(oldData[i]);
        } else {
            data.push({
                x: Math.floor(Math.random() * 100)
            });
        }
    }
    return data;
}

export default class Bar {
    @prop min = DefaultMinValue;
    @prop max = DefaultMaxValue;
    @prop label = 'default label';
    @prop title = 'default title';

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

    get handleClick() {
        return () => {
            this.counter += 1;
            const newData = produceNewData(this.data, this.min, this.max);
            this.data = newData;
            console.log('clicked');
        };
    }
}

// Example of usage:
// <Bar min="5" max="10" label="re-shuffle" />
