import { Element, createElement } from 'engine';

function tmpl$1($api, $cmp, $slotset, $ctx) {
    const { d: api_dynamic, h: api_element } = $api;

    return [api_element(
        "div",
        {},
        [api_dynamic($cmp.x)]
    )];
}

class Foo extends Element {
    render() {
        return tmpl$1;
    }
}

function tmpl($api, $cmp, $slotset, $ctx) {
    const { c: api_custom_element, h: api_element } = $api;

    return [api_element(
        "div",
        {
            classMap: {
                container: true
            }
        },
        [api_custom_element(
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
