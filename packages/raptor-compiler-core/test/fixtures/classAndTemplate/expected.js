import _a$b from 'a:b';

const memoized = Symbol();
var _tmpl = function ($api, $cmp) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        {
            class: "bar"
        },
        [$api.h(
            "ul",
            {
                class: $cmp["my-list"]
            },
            $api.f([$api.v(
                _a$b,
                {},
                ["first"]
            ), $api.i($cmp.items, function (item) {
                return $api.h(
                    "li",
                    {
                        class: "item"
                    },
                    [$api.s(item)]
                );
            }), $api.s($cmp.last)])
        )]
    )];
};
const templateUsedIds = ["my-list", "items", "last"];

const DefaultMinValue = 5;
const DefaultMaxValue = 50;

class ClassAndTemplate {

    constructor() {
        this.counter = 0;
        this.itemClassName = 'item';
        this.data = [];
    }

    broza(x) {
        return x;
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

    render() {
        return _tmpl;
    }

}
ClassAndTemplate.tagName = 'fixtures-classandtemplate';
ClassAndTemplate.publicProps = {
    min: DefaultMinValue,
    max: DefaultMaxValue,
    label: null,
    title: function () {
        return { a: 1 };
    }
};
ClassAndTemplate.publicMethods = ['publicMethod'];
ClassAndTemplate.templateUsedIds = templateUsedIds;

export default ClassAndTemplate;
