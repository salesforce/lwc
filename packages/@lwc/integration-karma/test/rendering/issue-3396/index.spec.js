import { createElement } from 'lwc';
import Test from 'x/test';

describe('issue-3396', () => {
    it('should render lwc:if in correct order', async () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        elm.show = true;

        await Promise.resolve();

        const items = elm.shadowRoot.querySelectorAll('.item');
        const contents = Array.from(items).map((item) => item.innerText);

        expect(contents).toEqual(['1', '2', '3']);
    });
});
