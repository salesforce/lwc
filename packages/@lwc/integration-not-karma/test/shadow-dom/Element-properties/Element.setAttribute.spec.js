import { createElement } from 'lwc';

import TestWithDiv from 'c/testWithDiv';

it('should allow setting attributes manually', () => {
    const elm = createElement('c-foo', { is: TestWithDiv });
    document.body.appendChild(elm);
    const shadowRoot = elm.shadowRoot;
    shadowRoot.querySelector('div').setAttribute('id', 'something');
    expect(shadowRoot.querySelector('div').id).toBe('something');
});
