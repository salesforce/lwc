import { createElement } from 'lwc';

import Test from 'x/test';

const COMMENT_NODE = 8;

function getChildrenComments(node) {
    return Array.from(node.childNodes)
        .filter((node) => node.nodeType === COMMENT_NODE)
        .map((node) => node.nodeValue);
}

describe('html comments', () => {
    it('should be rendered within if', () => {
        const elm = createElement('x-test', { is: Test });
        elm.count = 1;
        document.body.appendChild(elm);

        let comments = getChildrenComments(elm.shadowRoot);
        expect(comments).toContain('Comment for odd number');
        expect(comments).not.toContain('Comment for even number');

        elm.count = 2;

        return Promise.resolve().then(() => {
            comments = getChildrenComments(elm.shadowRoot);
            expect(comments).toContain('Comment for even number');
            expect(comments).not.toContain('Comment for odd number');
        });
    });

    it('should be rendered within for:each', () => {
        const elm = createElement('x-test', { is: Test });
        elm.count = 1;
        document.body.appendChild(elm);

        let comments = getChildrenComments(elm.shadowRoot);
        expect(comments.filter((c) => c === 'Comment inside for:each')).toHaveSize(1);

        elm.count = 2;

        return Promise.resolve().then(() => {
            comments = getChildrenComments(elm.shadowRoot);
            expect(comments.filter((c) => c === 'Comment inside for:each')).toHaveSize(2);
        });
    });

    it('should be rendered within slots', () => {
        const elm = createElement('x-test', { is: Test });
        elm.count = 1;
        document.body.appendChild(elm);

        const child = elm.shadowRoot.querySelector('x-child');

        let comments = getChildrenComments(child);
        expect(comments).toContain('slotted:odd comment');

        elm.count = 2;

        return Promise.resolve().then(() => {
            comments = getChildrenComments(child);
            expect(comments).not.toContain('slotted:odd comment');
        });
    });
});
