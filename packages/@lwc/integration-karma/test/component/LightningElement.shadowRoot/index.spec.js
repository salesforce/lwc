import { createElement } from 'lwc';
import XTest from 'x/test';

it('should always return null when accessing shadowRoot property from within the component', () => {
    const el = createElement('x-test', { is: XTest });
    document.body.appendChild(el);

    expect(el.getShadowRoot()).toBe(null);
});

it('should be able to access the shadowRoot property from outside the component', () => {
    const el = createElement('x-test', { is: XTest });
    document.body.appendChild(el);

    expect(el.shadowRoot).not.toBe(null);
    expect(el.shadowRoot).toBeInstanceOf(ShadowRoot);
});
