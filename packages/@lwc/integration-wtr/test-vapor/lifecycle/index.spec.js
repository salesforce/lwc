import { createElement } from 'lwc';
import Life from 'x/life';

describe('vapor: lifecycle hooks', () => {
    it('invokes connectedCallback on insertion', () => {
        const elm = createElement('x-life', { is: Life });
        document.body.appendChild(elm);
        // connectedCallback set phase to 'connected' before mount paint.
        expect(elm.shadowRoot.querySelector('div').textContent).toBe('connected');
    });

    it('invokes disconnectedCallback on removal', () => {
        window.__vaporLifecycle = {};
        const elm = createElement('x-life', { is: Life });
        document.body.appendChild(elm);
        document.body.removeChild(elm);
        expect(window.__vaporLifecycle.disconnected).toBe(true);
    });
});
