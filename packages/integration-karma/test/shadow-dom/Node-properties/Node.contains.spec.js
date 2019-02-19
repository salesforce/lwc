import { createElement } from 'test-utils';

import Slotted from 'x/slotted';

describe('Node.contains', () => {
    it('should return the right value for node outside the shadow tree', () => {
        const div = document.createElement('div');
        document.body.appendChild(div);

        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.contains(div)).toBe(false);
    });

    it('should return the right value for nodes in the same shadow tree', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const { shadowRoot } = elm;
        const container = shadowRoot.querySelector('x-container');

        expect(shadowRoot.contains(shadowRoot)).toBe(true);
        expect(shadowRoot.contains(shadowRoot.querySelector('.outer'))).toBe(true);
        expect(shadowRoot.contains(container)).toBe(true);
        expect(shadowRoot.contains(shadowRoot.querySelector('.slotted'))).toBe(true);
        expect(shadowRoot.contains(shadowRoot.querySelector('.slotted').firstChild)).toBe(true);

        expect(shadowRoot.querySelector('.outer').contains(shadowRoot)).toBe(false);
        expect(shadowRoot.querySelector('.outer').contains(container)).toBe(true);
        expect(
            shadowRoot.querySelector('.outer').contains(shadowRoot.querySelector('.slotted')),
        ).toBe(true);
    });

    it('should return the right value for slotted node', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const { shadowRoot } = elm;
        const container = shadowRoot.querySelector('x-container');

        expect(container.contains(container.shadowRoot)).toBe(false);
        expect(container.contains(container.shadowRoot.firstChild)).toBe(false);

        expect(
            container.shadowRoot
                .querySelector('.container')
                .contains(shadowRoot.querySelector('.slotted')),
        ).toBe(false);
        expect(
            container.shadowRoot
                .querySelector('slot')
                .contains(shadowRoot.querySelector('.slotted')),
        ).toBe(false);
    });
});
