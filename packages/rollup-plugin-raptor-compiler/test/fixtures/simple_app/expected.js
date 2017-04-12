import { Element, createElement } from 'raptor';

function tmpl$1($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
    return [$api.h(
        "div",
        {},
        [$cmp.x]
    )];
}
tmpl$1.ids = ["x"];

class Foo extends Element {
    render() {
        return tmpl$1;
    }
}

function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
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

class App {
    constructor() {
        this.list = [];
    }
    render() {
        return tmpl;
    }
}

const container = document.getElementById('main');
const element = createElement('x-app', { is: App });
container.appendChild(element);
