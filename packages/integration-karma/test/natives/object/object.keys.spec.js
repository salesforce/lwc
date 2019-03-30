import { createElement } from 'test-utils';
import XObjectKeys from 'x/objectKeys';

describe('Object keys', () => {
    let shadowRoot;
    beforeAll(() => {
        const elm = createElement('x-object-entries', { is: XObjectKeys });
        document.body.appendChild(elm);
        shadowRoot = elm.shadowRoot;
    });

    it('should have the right value', function() {
        const element = shadowRoot.querySelector('.key');
        expect(element.textContent).toBe('key');
    });
});
