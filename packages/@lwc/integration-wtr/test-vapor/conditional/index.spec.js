import { createElement } from 'lwc';
import Toggle from 'x/toggle';

describe('vapor: conditional rendering (lwc:if)', () => {
    it('renders nothing for the branch when condition is false', () => {
        const elm = createElement('x-toggle', { is: Toggle });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.querySelector('p')).toBeNull();
        expect(elm.shadowRoot.querySelector('span').textContent).toBe('always here');
    });

    it('renders the branch when condition is true', () => {
        const elm = createElement('x-toggle', { is: Toggle });
        elm.visible = true;
        document.body.appendChild(elm);
        expect(elm.shadowRoot.querySelector('p').textContent).toBe('visible content');
    });

    it('reactively toggles the branch', () => {
        const elm = createElement('x-toggle', { is: Toggle });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.querySelector('p')).toBeNull();

        elm.visible = true;
        expect(elm.shadowRoot.querySelector('p')).not.toBeNull();

        elm.visible = false;
        expect(elm.shadowRoot.querySelector('p')).toBeNull();
    });

    it('keeps sibling static content stable across toggles', () => {
        const elm = createElement('x-toggle', { is: Toggle });
        document.body.appendChild(elm);
        const span = elm.shadowRoot.querySelector('span');
        elm.visible = true;
        elm.visible = false;
        expect(elm.shadowRoot.querySelector('span')).toBe(span);
    });
});
