import { createElement } from 'lwc';

import TestWithDiv from 'x/testWithDiv';

it('should allow setting attributes manually', () => {
    const elm = createElement('x-foo', { is: TestWithDiv });
    document.body.appendChild(elm);
    const shadowRoot = elm.shadowRoot;
    shadowRoot.querySelector('div').setAttribute('id', 'something');
    expect(shadowRoot.querySelector('div').id).toBe('something');
});
