const DefaultMinValue = 5;
const DefaultMaxValue = 50;

export default class ClassAndTemplate {
    min = DefaultMinValue;
    max = DefaultMaxValue;
    label;
    title = {a : 1};

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