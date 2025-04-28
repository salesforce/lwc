import ContextParent from 'x/contextParent';
import { createElement } from 'lwc';

describe('update', () => {
    it('connects contextful fields when running connectedCallback 2', () => {
        const elm = createElement('x-context-parent', { is: ContextParent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-context-child').shadowRoot.querySelector('x-context-leaf');
        expect(child.shadowRoot.querySelector('p').textContent).toBe('Leaf context: foo');

        expect(child).toBeDefined();
    });
});