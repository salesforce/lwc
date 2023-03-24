import { createElement } from 'lwc';

import Test from 'x/test';

describe('vfragment sequential reordering', () => {
    it('move fragment left (["foo", "fragment"] => ["fragment", "bar"])', async () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
        await Promise.resolve();

        // Setup
        elm.beforeItems = ['foo'];
        elm.afterItems = [];
        await Promise.resolve();

        // Reorder
        elm.beforeItems = [];
        elm.afterItems = ['bar'];
        await Promise.resolve();

        const childNodes = elm.shadowRoot.childNodes;
        const contents = Array.from(childNodes).map((node) => node.textContent);
        expect(contents).toEqual(['', '一', '二', '三', '', '', 'bar', '']);
    });

    it('move fragment right (["fragment", "foo"] => ["bar", "fragment"])', async () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
        await Promise.resolve();

        // Setup
        elm.beforeItems = [];
        elm.afterItems = ['foo'];
        await Promise.resolve();

        // Reorder
        elm.beforeItems = ['bar'];
        elm.afterItems = [];
        await Promise.resolve();

        const childNodes = elm.shadowRoot.childNodes;
        const contents = Array.from(childNodes).map((node) => node.textContent);
        expect(contents).toEqual(['', 'bar', '', '', '一', '二', '三', '']);
    });
});
