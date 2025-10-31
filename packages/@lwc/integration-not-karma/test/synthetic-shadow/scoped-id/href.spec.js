import { createElement } from 'lwc';

import HrefStatic from 'c/hrefStatic';
import HrefDynamic from 'c/hrefDynamic';
import HrefDangling from 'c/hrefDangling';
import HrefBooleanTrue from 'c/hrefBooleanTrue';
import HrefBooleanTrueNoId from 'c/hrefBooleanTrueNoId';
import HrefDynamicEmptyString from 'c/hrefDynamicEmptyString';
import HrefDynamicUndefined from 'c/hrefDynamicUndefined';
import HrefDynamicNull from 'c/hrefDynamicNull';

function testHref(type, create) {
    describe(`${type} href attribute values`, () => {
        let elm;

        beforeEach(() => {
            elm = create();
            document.body.appendChild(elm);
        });

        it('should transform fragment-only urls (anchor)', () => {
            const anchor = elm.shadowRoot.querySelector('.anchor-fragment-url');
            const id = elm.shadowRoot.querySelector('.sanjo').getAttribute('id');
            expect(anchor.getAttribute('href')).toBe(`#${id}`);
        });

        it('should not transform relative urls (anchor)', () => {
            const anchor = elm.shadowRoot.querySelector('.anchor-relative-url');
            const url = anchor.getAttribute('data-id');
            expect(anchor.getAttribute('href')).toBe(url);
        });

        it('should not transform absolute urls (anchor)', () => {
            const anchor = elm.shadowRoot.querySelector('.anchor-absolute-url');
            const url = anchor.getAttribute('data-id');
            expect(anchor.getAttribute('href')).toBe(url);
        });

        it('should transform fragment-only urls (area)', () => {
            const area = elm.shadowRoot.querySelector('.area-fragment-url');
            const id = elm.shadowRoot.querySelector('.sanjo').getAttribute('id');
            expect(area.getAttribute('href')).toBe(`#${id}`);
        });

        it('should not transform relative urls (area)', () => {
            const area = elm.shadowRoot.querySelector('.area-relative-url');
            const url = area.getAttribute('data-id');
            expect(area.getAttribute('href')).toBe(url);
        });

        it('should not transform absolute urls (area)', () => {
            const area = elm.shadowRoot.querySelector('.area-absolute-url');
            const url = area.getAttribute('data-id');
            expect(area.getAttribute('href')).toBe(url);
        });
    });
}

testHref('static', () => createElement('c-href-static', { is: HrefStatic }));
testHref('dynamic', () => createElement('c-href-dynamic', { is: HrefDynamic }));

// Delete this test when we transform all href values with fragment-only urls
// https://github.com/salesforce/lwc/issues/1150
it('should not transform fragment-only urls when the template has no ids', () => {
    const elm = createElement('c-href-dangling', { is: HrefDangling });
    document.body.appendChild(elm);
    expect(elm.shadowRoot.querySelector('a').getAttribute('href')).toBe('#foo');
    expect(elm.shadowRoot.querySelector('area').getAttribute('href')).toBe('#bar');
});
// Enable this test when we transform all href values with fragment-only urls
// TODO [#1150]: Always mangle frag-id href attribute values
xit('should transform fragment-only urls even when the template has no ids', () => {
    const elm = createElement('c-href-dangling', { is: HrefDangling });
    document.body.appendChild(elm);
    expect(elm.shadowRoot.querySelector('a').getAttribute('href')).not.toBe('#foo');
    expect(elm.shadowRoot.querySelector('area').getAttribute('href')).not.toBe('#bar');
});

describe('boolean true', () => {
    const scenarios = [
        {
            name: 'no id',
            Ctor: HrefBooleanTrueNoId,
            tagName: 'c-href-boolean-true-no-id',
        },
        { name: 'with id', Ctor: HrefBooleanTrue, tagName: 'c-href-boolean-true' },
    ];

    scenarios.forEach(({ name, Ctor, tagName }) => {
        describe(name, () => {
            // For the "boolean true" case (e.g. `<a href>` or `<area href>`), no transformation is applied
            it('does not transform href', () => {
                const elm = createElement(tagName, { is: Ctor });
                document.body.appendChild(elm);

                expect(elm.shadowRoot.querySelector('a').getAttribute('href')).toBe('');
                expect(elm.shadowRoot.querySelector('area').getAttribute('href')).toBe('');
            });
        });
    });
});

describe('dynamic empty value', () => {
    const scenarios = [
        {
            name: 'empty string',
            Ctor: HrefDynamicEmptyString,
            tagName: 'c-href-dynamic-empty-string',
        },
        { name: 'undefined', Ctor: HrefDynamicUndefined, tagName: 'c-href-dynamic-undefined' },
        { name: 'null', Ctor: HrefDynamicNull, tagName: 'c-href-dynamic-null' },
    ];

    scenarios.forEach(({ name, Ctor, tagName }) => {
        describe(name, () => {
            it('renders href as expected', () => {
                const elm = createElement(tagName, { is: Ctor });
                document.body.appendChild(elm);

                const expected = name === 'empty string' ? '' : null;

                expect(elm.shadowRoot.querySelector('.sanjo').getAttribute('id')).toBe(expected);
                expect(elm.shadowRoot.querySelector('a').getAttribute('href')).toBe(expected);
                expect(elm.shadowRoot.querySelector('area').getAttribute('href')).toBe(expected);
            });
        });
    });
});
