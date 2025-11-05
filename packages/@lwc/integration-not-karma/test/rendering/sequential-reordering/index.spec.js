import { createElement } from 'lwc';

import Test from 'x/test';

describe('vfragment sequential reordering', () => {
    it('move fragment left', async () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
        await Promise.resolve();

        // Setup
        elm.beforeItems = ['foo'];
        elm.afterItems = [];
        await Promise.resolve();

        let childNodes = elm.shadowRoot.childNodes;
        let contents = Array.from(childNodes).map((node) => node.textContent);
        expect(contents).toEqual(['', 'foo', '', '', '一', '二', '三', '']);

        // Reorder
        elm.beforeItems = [];
        elm.afterItems = ['bar'];
        await Promise.resolve();

        childNodes = elm.shadowRoot.childNodes;
        contents = Array.from(childNodes).map((node) => node.textContent);
        expect(contents).toEqual(['', '一', '二', '三', '', '', 'bar', '']);
    });

    it('move fragment right', async () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
        await Promise.resolve();

        // Setup
        elm.beforeItems = [];
        elm.afterItems = ['foo'];
        await Promise.resolve();

        let childNodes = elm.shadowRoot.childNodes;
        let contents = Array.from(childNodes).map((node) => node.textContent);
        expect(contents).toEqual(['', '一', '二', '三', '', '', 'foo', '']);

        // Reorder
        elm.beforeItems = ['bar'];
        elm.afterItems = [];
        await Promise.resolve();

        childNodes = elm.shadowRoot.childNodes;
        contents = Array.from(childNodes).map((node) => node.textContent);
        expect(contents).toEqual(['', 'bar', '', '', '一', '二', '三', '']);
    });
});
