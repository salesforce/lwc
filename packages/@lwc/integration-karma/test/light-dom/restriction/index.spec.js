import { createElement } from 'lwc';

import Component from 'x/component';

describe('restriction', () => {
    it('should not restrict setting innerHTML on non-portaled light DOM component', () => {
        const elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);

        expect(() => {
            elm.querySelector('div').innerHTML = '<span>hello</span>';
        }).not.toLogErrorDev();
        expect(elm.querySelector('div span').textContent).toEqual('hello');
    });

    it('should restrict setting outerHTML on light DOM component', () => {
        const elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);

        expect(() => {
            elm.querySelector('div').outerHTML = 'foo';
        }).toThrowErrorDev(TypeError, 'Invalid attempt to set outerHTML on Element.');
    });
});
