import { createElement } from 'lwc';

import TestWithDiv from 'x/testWithDiv';

it('should allow setting id properties manually', () => {
    const elm = createElement('x-foo', { is: TestWithDiv });
    document.body.appendChild(elm);
    const shadowRoot = elm.shadowRoot;
    shadowRoot.querySelector('div').id = 'something';
    expect(shadowRoot.querySelector('div').getAttribute('id')).toBe('something');
});
