import { createElement } from 'lwc';

import Test from 'x/test';
import SingleFragments from 'x/singleFragments';

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
        expect(contents).toEqual(['foo', '一', '二', '三']);

        // Reorder
        elm.beforeItems = [];
        elm.afterItems = ['foo'];
        await Promise.resolve();

        childNodes = elm.shadowRoot.childNodes;
        contents = Array.from(childNodes).map((node) => node.textContent);
        expect(contents).toEqual(['一', '二', '三', 'foo']);
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
        expect(contents).toEqual(['一', '二', '三', 'foo']);

        // Reorder
        elm.beforeItems = ['foo'];
        elm.afterItems = [];
        await Promise.resolve();

        childNodes = elm.shadowRoot.childNodes;
        contents = Array.from(childNodes).map((node) => node.textContent);
        expect(contents).toEqual(['foo', '一', '二', '三']);
    });

    it('inserts fragments', async () => {
        const elm = createElement('x-complex', { is: SingleFragments });
        document.body.appendChild(elm);
        await Promise.resolve();

        let childNodes = elm.shadowRoot.childNodes;
        let contents = Array.from(childNodes).map((node) => node.textContent);
        expect(contents).toEqual(['2', 'middle', '4']);

        // Insert between two existing fragments
        elm.items = [null, 2, 3, 4];
        await Promise.resolve();

        childNodes = elm.shadowRoot.childNodes;
        contents = Array.from(childNodes).map((node) => node.textContent);
        expect(contents).toEqual(['2', 'middle', '3', '4']);

        // Insert at beginning, move last node to second node, move first node to last node
        elm.items = [1, 4, 3, 2];
        await Promise.resolve();

        childNodes = elm.shadowRoot.childNodes;
        contents = Array.from(childNodes).map((node) => node.textContent);
        expect(contents).toEqual(['1', '4', 'middle', '3', '2']);
    });
});
