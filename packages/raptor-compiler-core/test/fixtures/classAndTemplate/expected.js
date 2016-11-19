import 'aura';

var _t = function ({
    h,
    i
}) {
    return h(
        "section",
        null,
        ["Test"]
    );
};

function produceNewData(oldData, min, max) {
    data.push(1);
}

class Bar {
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

    render(p) {
        return _t.call(this, p);
    }

}

export default Bar;