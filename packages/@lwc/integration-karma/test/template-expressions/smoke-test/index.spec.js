import { createElement } from 'lwc';

import Test from 'x/test';

it(`should support call expressions`, () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('div').getAttribute('foo')).toBe('bar');
});
