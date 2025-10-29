import { LightningElement } from 'lwc';

if (!customElements.get('mixed-shadow-mode-retargeting')) {
    customElements.define(
        'mixed-shadow-mode-retargeting',
        class extends HTMLElement {
            constructor() {
                super();
                this._shadowRoot = this.attachShadow({ mode: 'closed' });
                this._shadowRoot.innerHTML = `<slot></slot><button></button>`;
            }
            click() {
                this._shadowRoot.querySelector('button').click();
            }
        }
    );
}

export default class extends LightningElement {}
