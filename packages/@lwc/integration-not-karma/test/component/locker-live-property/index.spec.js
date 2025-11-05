import { createElement } from 'lwc';
import Component from 'x/component';

describe('locker-live-property', () => {
    it('should pass the hasOwnProperty check for the locker live property', () => {
        const elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('div').textContent).toEqual('true');
    });
});
