import { createElement } from 'lwc';
import Basic from 'x/basic';
import Correct from 'x/correct';

it('should always return null when accessing shadowRoot property from within the component', () => {
    const el = createElement('x-basic', { is: Basic });
    document.body.appendChild(el);

    expect(el.getShadowRoot()).toBe(null);
});

it('should be able to access the shadowRoot property from outside the component', () => {
    const el = createElement('x-basic', { is: Basic });
    document.body.appendChild(el);

    expect(el.shadowRoot).not.toBe(null);
    expect(el.shadowRoot).toBeInstanceOf(ShadowRoot);
});

it('uses the correct shadow root - W-17441501', () => {
    const el = createElement('x-correct', { is: Correct });
    document.body.appendChild(el);

    expect(el.shadowRoot.textContent).toBe('');
});
