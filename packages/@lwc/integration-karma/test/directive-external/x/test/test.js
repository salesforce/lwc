import { LightningElement } from 'lwc';

class FooBar extends HTMLElement {
    static observedAttributes = ['baz'];
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'baz') {
            this._baz = `${newValue}-attr`;
        }
    }

    set baz(value) {
        this._baz = `${value}-prop`;
    }
    get baz() {
        return this._baz;
    }
}

export default class Test extends LightningElement {
    connectedCallback() {
        customElements.define('foo-bar', FooBar);
    }
}
