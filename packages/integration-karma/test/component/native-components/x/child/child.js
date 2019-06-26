export default class Child extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        this.shadowRoot.innerHTML = 'miami';
    }
}
customElements.define('x-child', Child);
