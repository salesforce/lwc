import Test from 'x/test';

describe('Custom Element slotting', () => {
    const tagName = 'x-custom-element-slotting'; // unique tagName per file because we can't unregister custom elements
    if (process.env.NATIVE_SHADOW) {
        it('should render slotted content at the right place', () => {
            const elm = document.createElement(tagName);
            elm.attachShadow({ mode: 'open' });
            elm.shadowRoot.innerHTML = 'before<slot></slot>after';
            elm.innerText = 'Slotted';
            document.body.appendChild(elm);
            customElements.define(tagName, Test.CustomElementConstructor);
        });
    }
});
