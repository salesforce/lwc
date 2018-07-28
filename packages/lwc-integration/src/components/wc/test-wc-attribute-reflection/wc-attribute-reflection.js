import { Element, api, buildCustomElementConstructor } from 'engine';

// TODO: this does not work. @diego will fix it!
import ComponentWithX from 'wc-with-attribute-x';

export default class WiredPropSuite extends Element {
    renderedCallback() {
        const WC = buildCustomElementConstructor(ComponentWithX);
        customElements.define('x-foo', WC);
        const elm = document.createElement('x-foo');
        elm.setAttribute('title', 'something');
        elm.setAttribute('x', 2);
        this._elm = elm;
    }
    @api get programmatic() {
        return this._elm;
    }
    @api get declarative() {
        return this.template.querySelector('wc-with-attribute-x');
    }
}
