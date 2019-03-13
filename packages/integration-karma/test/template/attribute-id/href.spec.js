import { createElement } from 'test-utils';

import HrefStatic from 'x/hrefStatic';
import HrefDynamic from 'x/hrefDynamic';

describe('static href attribute values', () => {
    const elm = createElement('x-href-static', { is: HrefStatic });
    document.body.appendChild(elm);

    it('should transform fragment-only urls (anchor)', () => {
        const anchor = elm.shadowRoot.querySelector('.anchor-fragment-url');
        const staticId = elm.shadowRoot.querySelector('.sanjo').getAttribute('id');
        expect(anchor.getAttribute('href')).toBe(`#${staticId}`);
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
        const staticId = elm.shadowRoot.querySelector('.sanjo').getAttribute('id');
        expect(area.getAttribute('href')).toBe(`#${staticId}`);
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

describe('dynamic href attribute values', () => {
    const elm = createElement('x-href-dynamic', { is: HrefDynamic });
    document.body.appendChild(elm);

    it('should transform fragment-only urls (anchor)', () => {
        const anchor = elm.shadowRoot.querySelector('.anchor-fragment-url');
        const dynamicId = elm.shadowRoot.querySelector('.sanjo').getAttribute('id');
        expect(anchor.getAttribute('href')).toBe(`#${dynamicId}`);
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
        const dynamicId = elm.shadowRoot.querySelector('.sanjo').getAttribute('id');
        expect(area.getAttribute('href')).toBe(`#${dynamicId}`);
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
