import { createElement } from 'test-utils';
import XObjectAssign from 'x/objectAssign';

describe('Issue 828 - Object assign', () => {
    let shadowRoot;
    beforeAll(() => {
        const elm = createElement('x-object-assign', { is: XObjectAssign });
        document.body.appendChild(elm);
        shadowRoot = elm.shadowRoot;
    });

    it('should return proper value', function() {
        const element = shadowRoot.querySelector('.assign');
        expect(element.textContent).toBe('foo');
    });
});
