import { createElement } from 'lwc';

import Parent from 'x/parent';

describe('Key outside iteration', () => {
    it('should work with a key attribute defined outside of an iteration', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);

        expect(
            elm.shadowRoot.querySelector('x-child').shadowRoot.querySelector('div').textContent
        ).toEqual('red');
        elm.color = 'blue';

        return Promise.resolve().then(() => {
            expect(
                elm.shadowRoot.querySelector('x-child').shadowRoot.querySelector('div').textContent
            ).toEqual('blue');
        });
    });
});
