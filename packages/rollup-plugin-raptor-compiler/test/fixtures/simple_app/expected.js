import { HTMLElement, createElement } from 'raptor';

const memoized$1 = Symbol();
var html$1 = function ($api, $cmp, $slotset) {
    const m = $cmp[memoized$1] || ($cmp[memoized$1] = {});
    return [$api.h(
        "div",
        {},
        [$api.s($cmp.x)]
    )];
};

class Foo extends HTMLElement {
    render() {
        return html$1;
    }
}
Foo.tagName = "x-foo";

const memoized = Symbol();
var html = function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
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
};

class App {
    constructor() {
        this.list = [];
    }
    render() {
        return html;
    }
}
App.tagName = "x-app";

const container = document.getElementById('main');
const element = createElement('x-app', { is: App });
container.appendChild(element);
