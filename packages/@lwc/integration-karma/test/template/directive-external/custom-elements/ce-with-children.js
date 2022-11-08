if (!process.env.COMPAT) {
    class CEWithChildren extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.innerHTML = `
            <h1>Test h1</h1>
            <div>
                <p>Test p</p>
            </div>
            <slot></slot>
            `;
        }
    }
    'customElements' in window && customElements.define('ce-with-children', CEWithChildren);
}
