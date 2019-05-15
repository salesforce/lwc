import { createElement } from 'lwc';

import Slotted from 'x/slotted';

describe('Node.hasChildNodes', () => {
    it('should return the right value for nodes in the same shadow tree', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const { shadowRoot } = elm;
        const container = shadowRoot.querySelector('x-container');

        expect(elm.hasChildNodes()).toBe(false);
        expect(shadowRoot.hasChildNodes()).toBe(true);
        expect(container.hasChildNodes()).toBe(true);
        expect(shadowRoot.querySelector('.slotted').hasChildNodes()).toBe(true);
        expect(shadowRoot.querySelector('.slotted').firstChild.hasChildNodes()).toBe(false);
    });

    it('should return the right value for slotted nodes', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const { shadowRoot } = elm;
        const container = shadowRoot.querySelector('x-container');

        expect(container.shadowRoot.querySelector('.container').hasChildNodes()).toBe(true);
        expect(container.shadowRoot.querySelector('slot').hasChildNodes()).toBe(
            process.env.NATIVE_SHADOW
        );
    });
});
