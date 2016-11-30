const DefaultMinValue = 5;
const DefaultMaxValue = 50;

export default class Bar {
    @prop min = DefaultMinValue;
    @prop max = DefaultMaxValue;
    @prop label;
    @prop title;

    constructor() {
        this.counter = 0;
        this.itemClassName = 'item';
        this.data = [];
    }

    broza (x: string) {
        return x;
    }

    @method
    publicMethod () {
        console.log('test');
    }

    handleClick() {
        this.counter += 1;
        const newData = [];
        this.data = newData;
        console.log('clicked');
    }
}