import { createElement } from 'lwc';

import Container from 'x/container';
import Nested from 'x/nested';

describe('Scoped slots', () => {
    it('render properly', () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.innerHTML).toEqual(
            '<x-list><div slot="0:1">Hello LWC from Container</div><div slot="0:2">Hello Lit from Container</div></x-list>'
        );
    });

    it('render properly nested slots', () => {
        const elm = createElement('x-nested', { is: Nested });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.innerHTML).toEqual(
            '<x-child1><x-child2 slot="0"><div slot="0">from child 1 - from child 2</div></x-child2></x-child1>'
        );
    });
});
