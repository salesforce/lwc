import { createElement } from 'lwc';

import BasicParent from 'x/basicParent';

describe('scoped slots', () => {
    it('scoped slots work with default slots', () => {
        const elm = createElement('x-component', { is: BasicParent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-basic-child');
        expect(child.querySelector('span').innerHTML).toBe('1234 - Test');
        expect(elm.shadowRoot.querySelector('span').innerHTML).toBe('1234 - Test');
    });
});
