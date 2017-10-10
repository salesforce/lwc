import { Element, createElement } from 'engine';

function tmpl$1($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "div",
        {},
        [$api.d($cmp.x)]
    )];
}

class Foo extends Element {
    render() {
        return tmpl$1;
    }
}

function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "div",
        {
            classMap: {
                container: true
            }
        },
        [$api.c(
            "x-foo",
            Foo,
            {
                props: {
                    x: "1"
                }
            }
        )]
    )];
}

class App extends Element {
    constructor() {
        super();
        this.list = [];
    }
    render() {
        return tmpl;
    }
}

const container = document.getElementById('main');
const element = createElement('x-app', { is: App });
container.appendChild(element);
