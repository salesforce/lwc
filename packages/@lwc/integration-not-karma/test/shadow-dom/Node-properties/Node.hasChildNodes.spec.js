import { createElement } from 'lwc';

import Slotted from 'c/slotted';

describe('Node.hasChildNodes', () => {
    it('should return the right value for nodes in the same shadow tree', () => {
        const elm = createElement('c-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const { shadowRoot } = elm;
        const container = shadowRoot.querySelector('c-container');

        expect(elm.hasChildNodes()).toBe(false);
        expect(shadowRoot.hasChildNodes()).toBe(true);
        expect(container.hasChildNodes()).toBe(true);
        expect(shadowRoot.querySelector('.slotted').hasChildNodes()).toBe(true);
        expect(shadowRoot.querySelector('.slotted').firstChild.hasChildNodes()).toBe(false);
    });

    it('should return the right value for slotted nodes', () => {
        const elm = createElement('c-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const { shadowRoot } = elm;
        const container = shadowRoot.querySelector('c-container');

        expect(container.shadowRoot.querySelector('.container').hasChildNodes()).toBe(true);
        expect(container.shadowRoot.querySelector('slot').hasChildNodes()).toBe(
            Boolean(process.env.NATIVE_SHADOW)
        );
    });
});
