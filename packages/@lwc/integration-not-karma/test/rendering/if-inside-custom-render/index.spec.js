import { createElement } from 'lwc';
import CustomRender from 'c/customRender';

describe('using custom renderer with lwc:if', () => {
    it('should replace the entire template when switching templates in a custom render function', async () => {
        const elm = createElement('c-custom-render', { is: CustomRender });
        document.body.appendChild(elm);
        elm.next();

        await Promise.resolve();
        expect(elm.shadowRoot.textContent).toBe('TEMPLATE 2T2 nested 1T2 nested 2');
    });
});
