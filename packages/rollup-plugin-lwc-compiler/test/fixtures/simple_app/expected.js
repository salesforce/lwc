import { Element, createElement } from 'engine';

const style = undefined;

const style$2 = undefined;

function tmpl$1($api, $cmp, $slotset, $ctx) {
    const { d: api_dynamic, h: api_element } = $api;

    return [api_element(
        "div",
        {},
        [api_dynamic($cmp.x)]
    )];
}

if (style$2) {
  const tagName = "x-foo";
  const token = "x-foo_foo";

  tmpl$1.token = token;
  tmpl$1.style = style$2(tagName, token);
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

if (style) {
  const tagName = "x-app";
  const token = "x-app_app";

  tmpl.token = token;
  tmpl.style = style(tagName, token);
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
