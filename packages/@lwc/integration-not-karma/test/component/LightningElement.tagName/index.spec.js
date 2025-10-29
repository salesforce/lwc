import { createElement } from 'lwc';

import Override from 'c/override';
import Test from 'c/test';

it('should return the tag name', () => {
    const elm = createElement('c-test', { is: Test });
    expect(elm.test).toEqual('X-TEST');
});

it('should be overrideable', () => {
    const elm = createElement('c-override', { is: Override });
    expect(elm.tagName).toEqual('c-foo');
});
