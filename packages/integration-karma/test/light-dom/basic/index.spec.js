import { createElement } from 'lwc';

import Test from 'x/test';
describe('Basic Light DOM', () => {
    it('should not render properly', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.shadowRoot).toBeNull();
        expect(elm.firstChild.innerText).toEqual('Hello, Light DOM');
    });
});
