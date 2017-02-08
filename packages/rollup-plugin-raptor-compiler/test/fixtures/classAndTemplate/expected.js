const memoized = Symbol();
var _tmpl = function ($api, $cmp) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        {
            class: "foo"
        },
        ["Test"]
    )];
};
const templateUsedIds = [];

const DefaultMinValue = 5;
const DefaultMaxValue = 50;

function produceNewData(oldData, min, max) {
    data.push(1);
}

class ClassAndTemplate {

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

    render() {
        return _tmpl;
    }

}
ClassAndTemplate.tagName = 'fixtures-classandtemplate';
ClassAndTemplate.publicProps = {
    min: DefaultMinValue,
    max: DefaultMaxValue,
    label: null,
    title: null
};
ClassAndTemplate.templateUsedIds = templateUsedIds;

export default ClassAndTemplate;
