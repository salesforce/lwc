import { createElement } from 'lwc';

import HrefStatic from 'x/hrefStatic';
import HrefDynamic from 'x/hrefDynamic';
import HrefDangling from 'x/hrefDangling';

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

testHref('static', () => createElement('x-href-static', { is: HrefStatic }));
testHref('dynamic', () => createElement('x-href-dynamic', { is: HrefDynamic }));

// Delete this test when we transform all href values with fragment-only urls
// https://github.com/salesforce/lwc/issues/1150
it('should not transform fragment-only urls when the template has no ids', () => {
    const elm = createElement('x-href-dangling', { is: HrefDangling });
    document.body.appendChild(elm);
    expect(elm.shadowRoot.querySelector('a').getAttribute('href')).toBe('#foo');
});
// Enable this test when we transform all href values with fragment-only urls
// https://github.com/salesforce/lwc/issues/1150
xit('should transform fragment-only urls even when the template has no ids', () => {
    const elm = createElement('x-href-dangling', { is: HrefDangling });
    document.body.appendChild(elm);
    expect(elm.shadowRoot.querySelector('a').getAttribute('href')).not.toBe('#foo');
});
