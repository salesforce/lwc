import { createElement } from 'lwc';
import Scoped from 'x/scoped';

describe('vapor: scoped css (*.scoped.css)', () => {
    it('applies scoped styles via scope-token class', () => {
        const elm = createElement('x-scoped', { is: Scoped });
        document.body.appendChild(elm);
        const label = elm.shadowRoot.querySelector('.label');
        expect(getComputedStyle(label).color).toBe('rgb(10, 20, 30)');
        // The element should carry a scope-token class (lwc-*).
        const hasScopeClass = [...label.classList].some((c) => c.startsWith('lwc-'));
        expect(hasScopeClass).toBe(true);
    });
});
