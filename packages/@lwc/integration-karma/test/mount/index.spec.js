import { createElement } from 'lwc';

import Test from 'x/test';

if (process.env.NATIVE_SHADOW) {
    fdescribe('lwc:mount', () => {
        it('should render properly', () => {
            const elm = createElement('x-test', { is: Test });

            document.body.appendChild(elm);
            debugger;

            // expect(elm.shadowRoot).toBeNull();
            // expect(elm.firstChild.innerText).toEqual('Hello, Light DOM');
        });
    });
}
