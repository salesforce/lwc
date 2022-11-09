import { api, LightningElement } from 'lwc';

customElements.define(
    'foo-upgrade-before',
    class FooUpgradeBefore extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({ mode: 'open' });
            this._shadowRoot.innerHTML = `
            <slot></slot>
        `;
        }
    }
);

class FooUpgradeAfter extends HTMLElement {
    static observedAttributes = ['foo'];
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'foo') {
            this._foo = `${newValue}-attr`;
        }
    }

    set foo(value) {
        this._foo = `${value}-prop`;
    }
    get foo() {
        return this._foo;
    }
}

export default class Test extends LightningElement {
    @api
    value = 'default';

    @api
    upgrade() {
        customElements.define('foo-upgrade-after', FooUpgradeAfter);
    }
}
