import { createElement } from 'lwc';

import ObjectReference from 'x/objectReference';

describe('Object reference', () => {
    it('should re-render the object if the object is mutated (#1680)', () => {
        const elm = createElement('x-object-reference', { is: ObjectReference });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.object-reference').textContent).toBe('');

        elm.push('updated');
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('.object-reference').textContent).toBe('updated');
        });
    });
});
