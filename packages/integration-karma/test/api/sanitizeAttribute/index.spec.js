import { createElement } from 'test-utils';

import Xlink from 'x/xlink';

let originalSanitizeAttribute = Engine.sanitizeAttribute;
afterEach(() => {
    // Reset original sanitizer after each test.
    Engine.sanitizeAttribute = originalSanitizeAttribute;
});

it('uses the original passthrough sanitizer when not overridden', () => {
    const elm = createElement('x-link', { is: Xlink });
    document.body.appendChild(elm);

    const use = elm.shadowRoot.querySelector('use');
    expect(use.getAttribute('xlink:href')).toBe('/foo');
});

it('receives the right parameters', () => {
    spyOn(Engine, 'sanitizeAttribute');

    const elm = createElement('x-link', { is: Xlink });
    document.body.appendChild(elm);

    expect(Engine.sanitizeAttribute).toHaveBeenCalledWith(
        'use',
        'http://www.w3.org/2000/svg',
        'xlink:href',
        '/foo'
    );
});

it('replace the original attribute value with the returned value', () => {
    Engine.sanitizeAttribute = () => '/bar';

    const elm = createElement('x-link', { is: Xlink });
    document.body.appendChild(elm);

    const use = elm.shadowRoot.querySelector('use');
    expect(use.getAttribute('xlink:href')).toBe('/bar');
});
