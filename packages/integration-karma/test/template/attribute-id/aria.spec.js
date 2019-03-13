import { createElement } from 'test-utils';

import AriaStatic from 'x/ariaStatic';
import AriaDynamic from 'x/ariaDynamic';

const ID_REFERENCING_ARIA_ATTRS = new Set([
    'aria-activedescendant',
    'aria-controls',
    'aria-describedby',
    'aria-details',
    'aria-errormessage',
    'aria-flowto',
    'aria-labelledby',
    'aria-owns',
    'for',
]);

describe('static aria attribute values', () => {
    const elm = createElement('x-aria-static', { is: AriaStatic });
    document.body.appendChild(elm);

    it('should transform the `for` attribute value', () => {
        const label = elm.shadowRoot.querySelector('label');
        const ul = elm.shadowRoot.querySelector('ul');
        expect(label.getAttribute('for')).toBe(ul.getAttribute('id'));
    });

    it('should transform only the aria attributes that can have idref values', () => {
        elm.shadowRoot.querySelectorAll('li').forEach(li => {
            const ariaAttrName = li.className;
            const scopedId = elm.shadowRoot.querySelector('ul').getAttribute('id');
            if (ID_REFERENCING_ARIA_ATTRS.has(ariaAttrName)) {
                expect(li.getAttribute(ariaAttrName)).toBe(scopedId);
            } else {
                expect(li.getAttribute(ariaAttrName)).toBe('foo');
            }
        });
    });
});

describe('dynamic aria attribute values', () => {
    const elm = createElement('x-aria-dynamic', { is: AriaDynamic });
    document.body.appendChild(elm);

    it('should transform the `for` attribute value', () => {
        const label = elm.shadowRoot.querySelector('label');
        const ul = elm.shadowRoot.querySelector('ul');
        expect(label.getAttribute('for')).toBe(ul.getAttribute('id'));
    });

    it('should transform only the aria attributes that can have idref values', () => {
        elm.shadowRoot.querySelectorAll('li').forEach(li => {
            const ariaAttrName = li.className;
            const scopedId = elm.shadowRoot.querySelector('ul').getAttribute('id');
            if (ID_REFERENCING_ARIA_ATTRS.has(ariaAttrName)) {
                expect(li.getAttribute(ariaAttrName)).toBe(scopedId);
            } else {
                expect(li.getAttribute(ariaAttrName)).toBe('kamogawa');
            }
        });
    });
});
