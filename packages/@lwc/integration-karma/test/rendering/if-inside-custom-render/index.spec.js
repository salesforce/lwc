import { createElement } from 'lwc';
import CustomRender from 'x/customRender';

describe('using custom renderer with lwc:if', () => {
    it('should just work test debug', async function () {
        const elm = createElement('x-custom-render', { is: CustomRender });
        document.body.appendChild(elm);
        elm.next();

        return Promise.resolve().then(() => {
            expect(elm.innerText).toBe('TEMPLATE 2\nT2 nested 1\nT2 nested 2\nT2 nested 3');
        });
    });
});
