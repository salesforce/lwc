import { createElement } from 'lwc';

import Basic from 'x/basic';
import UsedInTemplate from 'x/usedInTemplate';
import UsedInJs from 'x/usedInJs';
import Aliased from 'aliased';

describe('template-only components', () => {
    it('should work as a basic component', () => {
        const elm = createElement('x-basic', { is: Basic });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.textContent).toContain('no JS');
    });

    it('should work when used in another template', () => {
        const elm = createElement('x-used-in-template', { is: UsedInTemplate });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.firstElementChild.shadowRoot.textContent).toContain('no JS');
    });

    it('should work when used in another component', () => {
        const elm = createElement('x-used-in-component', { is: UsedInJs });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.textContent).toContain('no JS');
    });

    it('should work when aliased', () => {
        const elm = createElement('x-aliased', { is: Aliased });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.textContent).toContain('no JS');
    });
});
