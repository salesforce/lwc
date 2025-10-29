import { createElement } from 'lwc';

import Test from 'c/test';

const TEST_NS = 'http://www.salesforce.com/2019/lwc';

it('should have access to attribute on the host element', () => {
    const elm = createElement('c-test', { is: Test });
    elm.setAttributeNS(TEST_NS, 'foo', 'bar');

    expect(elm.hasComponentAttributeNS(TEST_NS, 'foo')).toBeTrue();
});
