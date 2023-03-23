import { createElement } from 'lwc';

import Test from 'x/test';

describe('vfragment sequential reordering', () => {
    it('move left (["bar", "foo"] => ["foo", "baz"])', async () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
        await Promise.resolve();

        // Setup
        elm.beforeItems = ['bar'];
        await Promise.resolve();

        // Reorder
        elm.afterItems = ['baz'];
        await Promise.resolve();

        const items = elm.shadowRoot.querySelectorAll('.item');
        const contents = Array.from(items).map((item) => item.innerText);
        expect(contents).toEqual(['foo', 'baz']);
    });

    it('move right (["foo", "bar"] => ["baz", "foo"])', async () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
        await Promise.resolve();

        // Setup
        elm.afterItems = ['bar'];
        await Promise.resolve();

        // Reorder
        elm.beforeItems = ['baz'];
        await Promise.resolve();

        const items = elm.shadowRoot.querySelectorAll('.item');
        const contents = Array.from(items).map((item) => item.innerText);
        expect(contents).toEqual(['baz', 'foo']);
    });
});
