import { api, LightningElement } from 'lwc';

export default class extends LightningElement {
    @api data = 'default';

    @api upgrade() {
        customElements.define(
            'ce-with-delayed-upgrade',
            class extends HTMLElement {
                static observedAttributes = ['foo'];
                attributeChangedCallback(name, oldValue, newValue) {
                    if (name === 'foo') {
                        this._data = `${newValue}-attr`;
                    }
                }

                set foo(value) {
                    this._data = `${value}-prop`;
                }
                get foo() {
                    return this._data;
                }
            }
        );
    }
}
