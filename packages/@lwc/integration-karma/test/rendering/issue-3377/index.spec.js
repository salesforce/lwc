import { createElement } from 'lwc';
import Test from 'x/test';

describe('issue-3377', () => {
    it('should render lwc:if content after iteration', async () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        elm.addItem();
        elm.addItem();

        await Promise.resolve();

        const childNodes = elm.shadowRoot.childNodes;
        const contents = Array.from(childNodes).map((node) => node.textContent);
        expect(contents).toEqual(['0', '1', '', 'lwc:if', '']);
    });
});
