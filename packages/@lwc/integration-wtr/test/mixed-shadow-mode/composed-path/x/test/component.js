customElements.define(
    'x-mixed-shadow-mode-composed-path',
    class extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({ mode: 'closed' });
            this._button = document.createElement('button');
            this._button.addEventListener('click', (event) => {
                this.composedPath = event.composedPath();
            });
            this._shadowRoot.appendChild(this._button);
        }

        click() {
            this._button.click();
        }
    }
);
