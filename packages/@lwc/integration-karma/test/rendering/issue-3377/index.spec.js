import { createElement } from 'lwc';
import Test from 'x/test';

describe('issue-3377', () => {
    it('should render lwc:if content after iteration', async () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        elm.addItem();
        elm.addItem();

        await Promise.resolve();

        const items = elm.shadowRoot.querySelectorAll('.item');
        expect(items.length).toBe(3);
        expect(items[items.length - 1].className).toContain('lwc-if');
    });
});
