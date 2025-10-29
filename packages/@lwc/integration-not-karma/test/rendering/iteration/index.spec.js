import { createElement } from 'lwc';
import ForEach from 'c/forEach';
import Iterator from 'c/iterator';
import InlineForEach from 'c/inlineForEach';
import InlineIterator from 'c/inlineIterator';
import { extractDataIds } from '../../../helpers/utils.js';

describe('iteration rendering', () => {
    function validateRenderedChildren(elm, iterationType) {
        const isIterator = iterationType === 'iterator';
        const expectedChildren = elm.items;
        const { children } = elm.shadowRoot;
        expect(children.length).toEqual(expectedChildren.length);

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const expected = expectedChildren[i];
            const dataIds = extractDataIds(child);
            expect(dataIds.first.textContent).toEqual(isIterator ? (i === 0).toString() : '');
            expect(dataIds.last.textContent).toEqual(
                isIterator ? (i === children.length - 1).toString() : ''
            );
            expect(dataIds.index.textContent).toEqual(i.toString());
            expect(dataIds.value.textContent).toEqual(expected.toString());
        }
    }

    const components = [
        {
            Ctor: InlineForEach,
            type: 'inline',
            iterationType: 'for-each',
        },
        {
            Ctor: InlineIterator,
            type: 'inline',
            iterationType: 'iterator',
        },
        {
            Ctor: ForEach,
            type: 'template',
            iterationType: 'for-each',
        },
        {
            Ctor: Iterator,
            type: 'template',
            iterationType: 'iterator',
        },
    ];

    components.forEach(({ Ctor, type, iterationType }) => {
        const tag = `c-${type}-${iterationType}`;

        it(`${type} ${iterationType}`, async () => {
            const elm = createElement(tag, { is: Ctor });
            elm.items = [1, 2, 3, 4];
            document.body.appendChild(elm);
            validateRenderedChildren(elm, iterationType);
            const [c1, c2, c3, c4] = elm.shadowRoot.querySelectorAll('c-item');

            elm.items = [3, 1, 2, 4];
            await Promise.resolve();
            validateRenderedChildren(elm, iterationType);
            const [c3b, c1b, c2b, c4b] = elm.shadowRoot.querySelectorAll('c-item');
            expect(c1).toBe(c1b);
            expect(c2).toBe(c2b);
            expect(c3).toBe(c3b);
            expect(c4).toBe(c4b);
        });
    });
});
