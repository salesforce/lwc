import { createElement } from 'test-utils';

import Slotted from 'x/slotted';
import Container from 'x/container';

describe('Node.getRootNode', () => {
    it('root element', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        expect(elm.getRootNode()).toBe(document);
        expect(elm.getRootNode({ composed: true })).toBe(document);
    });

    it('disconnected root element', () => {
        const elm = createElement('x-slotted', { is: Slotted });

        expect(elm.getRootNode()).toBe(elm);
        expect(elm.getRootNode({ composed: true })).toBe(elm);
    });

    it('root element in a disconnected DOM tree', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        const frag = document.createDocumentFragment();
        frag.appendChild(elm);

        expect(elm.getRootNode()).toBe(frag);
        expect(elm.getRootNode({ composed: true })).toBe(frag);
    });

    it('shadowRoot', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const target = elm.shadowRoot;
        expect(target.getRootNode()).toBe(target);
        expect(target.getRootNode({ composed: true })).toBe(document);
    });

    it('element in the shadow', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const target = elm.shadowRoot.querySelector('x-container');
        expect(target.getRootNode()).toBe(elm.shadowRoot);
        expect(target.getRootNode({ composed: true })).toBe(document);
    });

    it('slotted element', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const target = elm.shadowRoot.querySelector('.slotted');
        expect(target.getRootNode()).toBe(elm.shadowRoot);
        expect(target.getRootNode({ composed: true })).toBe(document);
    });

    it('element in a nested shadow', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const container = elm.shadowRoot.querySelector('x-container');
        const target = container.shadowRoot.querySelector('.container');
        expect(target.getRootNode()).toBe(container.shadowRoot);
        expect(target.getRootNode({ composed: true })).toBe(document);
    });

    it('default slot content', () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        const target = elm.shadowRoot.querySelector('.default-slotted');
        expect(target.getRootNode()).toBe(elm.shadowRoot);
        expect(target.getRootNode({ composed: true })).toBe(document);
    });
});
