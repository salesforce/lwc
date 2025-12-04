import { createElement } from 'lwc';
import XTest from 'x/test';

describe('Node.textContent', () => {
    it('should not return comment text when Node.nodeType is ELEMENT_NODE', () => {
        const elm = document.createElement('div');
        elm.innerHTML =
            '<div>' +
            '<!-- Some comment -->' +
            'text content' +
            '<!-- Some other comment -->' +
            '</div>';

        expect(elm.textContent).toBe('text content');
    });

    it('should not return comment text from 2nd level ELEMENT_NODE', () => {
        const elm = document.createElement('div');

        elm.innerHTML =
            '<div>' +
            '<!-- Some comment -->' +
            'text content' +
            '<div>' +
            '<!-- 2nd level comment -->' +
            '2nd level text' +
            '</div>' +
            '<!-- Some other comment -->' +
            '</div>';

        expect(elm.textContent).toBe('text content2nd level text');
    });

    it('should return comment text when Node.nodeType is COMMENT_NODE', () => {
        const elm = document.createComment('Some comment');

        expect(elm.textContent).toBe('Some comment');
    });

    it('should not return comment text from the shadowRoot', () => {
        const elm = createElement('x-parent', { is: XTest });
        document.body.appendChild(elm);

        // since we remove the comments from the template, we need to add it manually
        elm.shadowRoot.appendChild(document.createComment('Some comment'));

        expect(elm.shadowRoot.textContent).toBe('text content');
    });
});
