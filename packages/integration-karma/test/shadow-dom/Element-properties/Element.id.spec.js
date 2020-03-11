import { createElement } from 'lwc';

import TestWithDiv from 'x/testWithDiv';
import IdValueUndefined from 'x/idValueUndefined';
import IdValueEmpty from 'x/idValueEmpty';
import CustomElementIdValueEmpty from 'x/customElementIdValueEmpty';
import CustomElementIdValueUndefined from 'x/customElementIdValueUndefined';

it('should allow setting id properties manually', () => {
    const elm = createElement('x-foo', { is: TestWithDiv });
    document.body.appendChild(elm);
    const shadowRoot = elm.shadowRoot;
    shadowRoot.querySelector('div').id = 'something';
    expect(shadowRoot.querySelector('div').getAttribute('id')).toBe('something');
});

describe('scoped-ids', () => {
    describe('expressions', () => {
        describe('custom elements', () => {
            it('should render expected id attribute value when its value is set to `undefined`', () => {
                const elm = createElement('x-foo', { is: CustomElementIdValueUndefined });
                expect(() => {
                    document.body.appendChild(elm);
                }).toLogErrorDev(
                    /\[LWC error\]: Invalid id value "undefined". The id attribute must contain a non-empty string./
                );
                const child = elm.shadowRoot.querySelector('x-child');
                // #1769: The difference in behavior of id attribute is tracked with this issue
                expect(child.getAttribute('id')).toBe('undefined');
            });

            it('should render the id attribute as a boolean attribute when its value is set to an empty string', () => {
                const elm = createElement('x-foo', { is: CustomElementIdValueEmpty });
                expect(() => {
                    document.body.appendChild(elm);
                }).toLogErrorDev(
                    /\[LWC error\]: Invalid id value "". The id attribute must contain a non-empty string./
                );
                const child = elm.shadowRoot.querySelector('x-child');
                expect(child.getAttribute('id')).toBe('');
            });
        });

        describe('native elements', () => {
            it('should not render id attribute when its value is set to null', () => {
                const elm = createElement('x-foo', { is: IdValueUndefined });
                expect(() => {
                    document.body.appendChild(elm);
                }).toLogErrorDev(
                    /\[LWC error\]: Invalid id value "undefined". The id attribute must contain a non-empty string./
                );
                const div = elm.shadowRoot.querySelector('div');
                expect(div.getAttribute('id')).toBeNull();
            });

            it('should render the id attribute as a boolean attribute when its value is set to an empty string', () => {
                const elm = createElement('x-foo', { is: IdValueEmpty });
                expect(() => {
                    document.body.appendChild(elm);
                }).toLogErrorDev(
                    /\[LWC error\]: Invalid id value "". The id attribute must contain a non-empty string./
                );
                const div = elm.shadowRoot.querySelector('div');
                expect(div.getAttribute('id')).toBe('');
            });
        });
    });
});
