import { createElement } from 'lwc';

import Override from 'x/override';
import Test from 'x/test';

it('should return the tag name', () => {
    const elm = createElement('x-test', { is: Test });
    expect(elm.test).toEqual('X-TEST');
});

it('should be overrideable', () => {
    const elm = createElement('x-override', { is: Override });
    expect(elm.tagName).toEqual('x-foo');
});
