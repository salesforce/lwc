import { createElement } from 'lwc';

import Component from 'x/component';

describe('restriction', () => {
    it('should not restrict setting innerHTML on non-portaled native shadow component', () => {
        const elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);

        expect(() => {
            elm.shadowRoot.querySelector('div').innerHTML = '<span>hello</span>';
        }).not.toLogErrorDev();
        expect(elm.shadowRoot.querySelector('div span').textContent).toEqual('hello');
    });

    it('should restrict setting outerHTML on native shadow component', () => {
        const elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);

        expect(() => {
            elm.shadowRoot.querySelector('div').outerHTML = 'foo';
        }).toThrowError(TypeError, 'Invalid attempt to set outerHTML on Element.');
    });
});
