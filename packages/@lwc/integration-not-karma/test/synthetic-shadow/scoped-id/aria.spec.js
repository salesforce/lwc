import { createElement } from 'lwc';

import AriaStatic from 'c/ariaStatic';
import AriaDynamic from 'c/ariaDynamic';
import AriaBooleanTrue from 'c/ariaBooleanTrue';
import AriaEmptyString from 'c/ariaEmptyString';

// https://github.com/salesforce/lwc/blob/67512dfea33ef529836d3fd483f56f72d3debc5c/packages/%40lwc/template-compiler/src/parser/constants.ts#L18-L28
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

function testAria(type, create) {
    describe(`${type} aria attribute values`, () => {
        let elm;

        beforeEach(async () => {
            elm = create();

            document.body.appendChild(elm);
            await Promise.resolve();
        });

        it('should transform the `for` attribute value', () => {
            const label = elm.shadowRoot.querySelector('label');
            const ul = elm.shadowRoot.querySelector('ul');
            expect(label.getAttribute('for')).toBe(ul.getAttribute('id'));
        });

        it('should transform only the aria attributes that can have idref values', () => {
            elm.shadowRoot.querySelectorAll('li').forEach((li) => {
                const ariaAttrName = li.className;
                const id = elm.shadowRoot.querySelector('ul').getAttribute('id');
                if (type === 'boolean-true' || type === 'empty-string') {
                    // boolean true (`<div aria-labelledby>`) and empty string (`<div aria-labelledby="">`)
                    // should both _not_ transform their values. This is for backwards compat.
                    expect(li.getAttribute(ariaAttrName)).toBe('');
                } else if (ID_REFERENCING_ARIA_ATTRS.has(ariaAttrName)) {
                    expect(li.getAttribute(ariaAttrName)).toBe(id);
                } else {
                    expect(li.getAttribute(ariaAttrName)).toBe('foo');
                }
            });
        });
    });
}

testAria('static', () => createElement('c-aria-static', { is: AriaStatic }));
testAria('dynamic', () => createElement('c-aria-dynamic', { is: AriaDynamic }));
testAria('boolean-true', () => createElement('c-aria-boolean-true', { is: AriaBooleanTrue }));
testAria('empty-string', () => createElement('c-aria-empty-string', { is: AriaEmptyString }));
