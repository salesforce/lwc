import { Element, api } from 'engine';

export default class Child extends Element {
    @api
    dispatchFoo() {
        this.template.querySelector('div').dispatchEvent(
            new CustomEvent('foo', {
                composed: true,
                bubbles: true,
            }),
        );
    }
}
