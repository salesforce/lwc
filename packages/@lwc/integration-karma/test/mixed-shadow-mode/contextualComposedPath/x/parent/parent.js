import { LightningElement, api } from 'lwc';

export default class Parent extends LightningElement {
    _parentComposedPath;

    @api
    get child() {
        return this.refs.child;
    }

    @api
    get childComposedPath() {
        return this.child.composedPath;
    }

    @api
    get parentComposedPath() {
        return this._parentComposedPath;
    }

    @api
    click() {
        this.child.click();
    }

    handleClick(event) {
        this._parentComposedPath = event.composedPath();
    }
}

class ContextualComposedPath extends HTMLElement {
    _composedPath;

    get composedPath() {
        return this._composedPath;
    }

    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: 'closed' });
        this._shadowRoot.innerHTML = `
            <div data-id="outerDiv">
                <div data-id="innerDiv">
                    <button data-id="button">Child</button>
                </div>
            </div>`;
    }

    connectedCallback() {
        this._shadowRoot.querySelector('button').addEventListener('click', (event) => {
            this._composedPath = event.composedPath();
        });
    }

    handleButtonClick(event) {
        this._composedPath = event.composedPath();
    }

    click() {
        this._shadowRoot.querySelector('button').click();
    }
}

customElements.define('x-contextual-composed-path', ContextualComposedPath);
