import { api, LightningElement } from 'lwc';

if (!process.env.COMPAT) {
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

    customElements.define(
        'foo-set-object',
        class FooSetObject extends HTMLElement {
            set prop(value) {
                this._prop = value;
            }
            get prop() {
                return this._prop;
            }
        }
    );
}

export default class Test extends LightningElement {
    @api
    value = 'default';

    @api
    upgrade() {
        if (!process.env.COMPAT) {
            customElements.define(
                'foo-upgrade-after',
                class FooUpgradeAfter extends HTMLElement {
                    static observedAttributes = ['foo'];
                    attributeChangedCallback(name, oldValue, newValue) {
                        if (name === 'foo') {
                            this._data = `${newValue}-attr`;
                        }
                    }

                    set foo(value) {
                        this._data = `${value}-prop`;
                    }
                    get data() {
                        return this._data;
                    }
                }
            );
        }
    }
}
