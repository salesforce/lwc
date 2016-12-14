var _tmpl = function ({
    i,
    f,
    e,
    h,
    v,
    s
}) {
    return h(
        "section",
        {
            "class": "foo"
        },
        ["Test"]
    );
};
const usedIdentifiers = [];

const DefaultMinValue = 5;
const DefaultMaxValue = 50;

function produceNewData(oldData, min, max) {
    data.push(1);
}

class Bar {

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
        return _tmpl.call(this, p);
    }

}
Bar.templateUsedProps = usedIdentifiers;
Bar.tagName = 'unknown-bar';
Bar.publicProps = {
    min: DefaultMinValue,
    max: DefaultMaxValue,
    label: null,
    title: null
};

export default Bar;