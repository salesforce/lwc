import { createElement } from 'lwc';

import TestWithDiv from 'x/testWithDiv';
import IdValueUndefined from 'x/idValueUndefined';
import IdValueEmpty from 'x/idValueEmpty';

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
                const elm = createElement('x-foo', { is: IdValueUndefined });
                expect(() => {
                    document.body.appendChild(elm);
                }).toLogErrorDev(
                    /\[LWC error\]: Invalid id value "undefined". The id attribute must contain a non-empty string./
                );
                const child = elm.shadowRoot.querySelector('x-child');
                expect(child.getAttribute('id')).toEqual(null);
            });

            it('should render the id attribute as a boolean attribute when its value is set to an empty string', () => {
                const elm = createElement('x-foo', { is: IdValueEmpty });
                expect(() => {
                    document.body.appendChild(elm);
                }).toLogErrorDev(
                    /\[LWC error\]: Invalid id value "". The id attribute must contain a non-empty string./
                );
                const child = elm.shadowRoot.querySelector('x-child');
                expect(child.getAttribute('id')).toEqual(null);
            });
        });

        describe('native elements', () => {
            it('should not render id attribute when its value is set to `undefined`', () => {
                const elm = createElement('x-foo', { is: IdValueUndefined });
                expect(() => {
                    document.body.appendChild(elm);
                }).toLogErrorDev(
                    /\[LWC error\]: Invalid id value "undefined". The id attribute must contain a non-empty string./
                );
                const div = elm.shadowRoot.querySelector('div');
                expect(div.getAttribute('id')).toEqual(null);
            });

            it('should render the id attribute as a boolean attribute when its value is set to an empty string', () => {
                const elm = createElement('x-foo', { is: IdValueEmpty });
                expect(() => {
                    document.body.appendChild(elm);
                }).toLogErrorDev(
                    /\[LWC error\]: Invalid id value "". The id attribute must contain a non-empty string./
                );
                const div = elm.shadowRoot.querySelector('div');
                expect(div.getAttribute('id')).toEqual('');
            });
        });
    });
});
