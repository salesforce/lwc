import { createElement } from 'lwc';
import CustomRender from 'x/customRender';

describe('using custom renderer with lwc:if', () => {
    it('should replace the entire template when switching templates in a custom render function', async function () {
        const elm = createElement('x-custom-render', { is: CustomRender });
        document.body.appendChild(elm);
        elm.next();

        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.textContent).toBe('TEMPLATE 2T2 nested 1T2 nested 2');
        });
    });
});
