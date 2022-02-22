import { extractDataIds } from 'test-utils';
import { createElement } from 'lwc';
import ForEach from 'x/forEach';
import Iterator from 'x/iterator';
import InlineForEach from 'x/inlineForEach';
import InlineIterator from 'x/inlineIterator';

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

    const components = {
        'x-inline-for-each': InlineForEach,
        'x-inline-iterator': InlineIterator,
        'x-template-for-each': ForEach,
        'x-template-iterator': Iterator,
    };

    ['inline'].forEach((type) => {
        ['iterator'].forEach((iterationType) => {
            const tag = `x-${type}-${iterationType}`;
            const Ctor = components[tag];

            it(`${type} ${iterationType}`, () => {
                const elm = createElement(tag, { is: Ctor });
                elm.items = [1, 2, 3, 4];
                document.body.appendChild(elm);
                validateRenderedChildren(elm, iterationType);
                const [c1, c2, c3, c4] = elm.shadowRoot.querySelectorAll('x-item');

                elm.items = [3, 1, 2, 4];
                return Promise.resolve().then(() => {
                    validateRenderedChildren(elm, iterationType);
                    const [c3b, c1b, c2b, c4b] = elm.shadowRoot.querySelectorAll('x-item');
                    expect(c1).toBe(c1b);
                    expect(c2).toBe(c2b);
                    expect(c3).toBe(c3b);
                    expect(c4).toBe(c4b);
                });
            });
        });
    });
});
