import { createElement } from 'lwc';

import TestWithDiv from 'c/testWithDiv';
import IdValueUndefined from 'c/idValueUndefined';
import IdValueEmpty from 'c/idValueEmpty';
import CustomElementIdValueEmpty from 'c/customElementIdValueEmpty';
import CustomElementIdValueUndefined from 'c/customElementIdValueUndefined';

it('should allow setting id properties manually', () => {
    const elm = createElement('c-foo', { is: TestWithDiv });
    document.body.appendChild(elm);
    const shadowRoot = elm.shadowRoot;
    shadowRoot.querySelector('div').id = 'something';
    expect(shadowRoot.querySelector('div').getAttribute('id')).toBe('something');
});

describe('scoped-ids', () => {
    describe('expressions', () => {
        describe('custom elements', () => {
            it('should render expected id attribute value when its value is set to `undefined`', () => {
                const elm = createElement('c-foo', { is: CustomElementIdValueUndefined });
                document.body.appendChild(elm);
                const child = elm.shadowRoot.querySelector('c-child');
                // #1769: The difference in behavior of id attribute is tracked with this issue
                expect(child.getAttribute('id')).toBe('undefined');
            });

            it('should render the id attribute as a boolean attribute when its value is set to an empty string', () => {
                const elm = createElement('c-foo', { is: CustomElementIdValueEmpty });
                document.body.appendChild(elm);
                const child = elm.shadowRoot.querySelector('c-child');
                expect(child.getAttribute('id')).toBe('');
            });
        });

        describe('native elements', () => {
            it('should not render id attribute when its value is set to null', () => {
                const elm = createElement('c-foo', { is: IdValueUndefined });
                document.body.appendChild(elm);
                const div = elm.shadowRoot.querySelector('div');
                expect(div.getAttribute('id')).toBeNull();
            });

            it('should render the id attribute as a boolean attribute when its value is set to an empty string', () => {
                const elm = createElement('c-foo', { is: IdValueEmpty });
                document.body.appendChild(elm);
                const div = elm.shadowRoot.querySelector('div');
                expect(div.getAttribute('id')).toBe('');
            });
        });
    });
});
