import { createElement } from 'lwc';

import Test from 'c/test';
import ConfusedWithText from 'c/confusedWithText';

const COMMENT_NODE = 8;

function getChildrenComments(node) {
    return Array.from(node.childNodes)
        .filter((node) => node.nodeType === COMMENT_NODE)
        .map((node) => node.nodeValue);
}

describe('html comments', () => {
    it('should be rendered within if', async () => {
        const elm = createElement('c-test', { is: Test });
        elm.count = 1;
        document.body.appendChild(elm);

        let comments = getChildrenComments(elm.shadowRoot);
        expect(comments).toContain('Comment for odd number');
        expect(comments).not.toContain('Comment for even number');

        elm.count = 2;

        await Promise.resolve();
        comments = getChildrenComments(elm.shadowRoot);
        expect(comments).toContain('Comment for even number');
        expect(comments).not.toContain('Comment for odd number');
    });

    it('should be rendered within for:each', async () => {
        const elm = createElement('c-test', { is: Test });
        elm.count = 1;
        document.body.appendChild(elm);

        let comments = getChildrenComments(elm.shadowRoot);
        expect(comments.filter((c) => c === 'Comment inside for:each')).toHaveSize(1);

        elm.count = 2;

        await Promise.resolve();
        comments = getChildrenComments(elm.shadowRoot);
        expect(comments.filter((c_1) => c_1 === 'Comment inside for:each')).toHaveSize(2);
    });

    it('should be rendered within slots', async () => {
        const elm = createElement('c-test', { is: Test });
        elm.count = 1;
        document.body.appendChild(elm);

        const child = elm.shadowRoot.querySelector('c-child');

        let comments = getChildrenComments(child);
        expect(comments).toContain('slotted:odd comment');

        elm.count = 2;

        await Promise.resolve();
        comments = getChildrenComments(child);
        expect(comments).not.toContain('slotted:odd comment');
    });

    it('should not confuse comments with text nodes', async () => {
        const elm = createElement('c-confused-with-text', { is: ConfusedWithText });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.textContent).toBe('helloworld');

        elm.comments = ['comment'];

        await Promise.resolve();
        const comments = getChildrenComments(elm.shadowRoot);
        expect(comments).toContain('Comment inside for:each');
        expect(elm.shadowRoot.textContent).toBe('hellocommentworld');
    });
});
