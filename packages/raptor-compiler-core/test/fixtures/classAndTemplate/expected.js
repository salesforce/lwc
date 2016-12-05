import { a$b } from 'a:b';

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
            "class": "bar"
        },
        [h(
            "ul",
            {
                "class": this.my-list
            },
            f([v(
                a$b,
                {},
                ["first"]
            ), i(this.items, item => {
                return h(
                    "li",
                    {
                        "class": "item"
                    },
                    [s(item)]
                );
            }), s(this.last)])
        )]
    );
};
const usedIdentifiers = ["my-list", "items", "last"];

const DefaultMinValue = 5;
const DefaultMaxValue = 50;

class Bar {

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

    render(p) {
        return _tmpl.call(this, p);
    }

}
Bar.publicProps = {
    min: DefaultMinValue,
    max: DefaultMaxValue,
    label: null,
    title: null
};
Bar.publicMethods = ['publicMethod'];
Bar.templateUsedProps = usedIdentifiers;

export default Bar;