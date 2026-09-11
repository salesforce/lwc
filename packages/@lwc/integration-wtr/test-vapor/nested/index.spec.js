import { createElement } from 'lwc';
import Parent from 'x/parent';

describe('vapor: nested components', () => {
    it('renders a child component with a passed prop', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-child');
        expect(child).not.toBeNull();
        const span = child.shadowRoot.querySelector('.child-name');
        expect(span.textContent).toBe('from-parent');
    });
});
