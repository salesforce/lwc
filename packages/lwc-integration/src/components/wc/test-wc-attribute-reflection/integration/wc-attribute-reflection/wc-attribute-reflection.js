import { LightningElement, api, buildCustomElementConstructor } from "lwc";
import ComponentWithX from 'integration/wcWithAttributeX';

export default class WiredPropSuite extends LightningElement {
    renderedCallback() {
        const WC = buildCustomElementConstructor(ComponentWithX);
        customElements.define('x-foo', WC);
        const elm = document.createElement('x-foo');
        elm.setAttribute('title', 'something');
        elm.setAttribute('x', 2);
        this._elm = elm;
        this.template.querySelector('.test').appendChild(elm);
    }
    @api get programmatic() {
        return this._elm;
    }
    @api get declarative() {
        return this.template.querySelector('integration-wc-with-attribute-x');
    }
}
