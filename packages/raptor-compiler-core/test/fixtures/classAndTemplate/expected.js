var _t = function ({
    i,
    f,
    e,
    h
}) {
    return h("section", null, [h("p", null, [this.test])]);
};

const DefaultMinValue = 5;
const DefaultMaxValue = 50;

class Bar {

    constructor() {
        this.counter = 0;
        this.itemClassName = 'item';
        this.data = [];
    }

    publicMethod() {
        console.log('test');
    }

    handleClick() {
        this.counter += 1;
        const newData = [];
        this.data = newData;
        console.log('clicked');
    }

    render(p) {
        return _t.call(this, p);
    }

}
Bar.$p$ = {
    min: DefaultMinValue,
    max: DefaultMaxValue,
    label: null,
    title: null
};
Bar.$m$ = {
    publicMethod: 1
};

Bar.$t$ = {
    test: 1
};
export default Bar;