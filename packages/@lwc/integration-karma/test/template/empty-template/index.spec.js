import { createElement } from 'lwc';

import Comment from 'x/comment';
import Mixed from 'x/mixed';
import NestedElement from 'x/nested-element';
import NestedText from 'x/nested-text';
import Test from 'x/test';
import MixedDirective from 'x/mixed-directive';

function testTemplateRendering(expected, actual) {
    expect(actual.length).toEqual(expected.length);

    for (let i = 0; i < actual.length; i++) {
        expect(actual[i].nodeType).toEqual(expected[i].nodeType);
        expect(actual[i].tagName).toEqual(expected[i].tagName);
        expect(actual[i].textContent).toEqual(expected[i].textContent);
    }
}

// These tests are to preserve incorrect behavior in the @lwc/template-compiler.
// The LWC team intends to remove this behavior but for now we're preserving it for backwards compatibility.
// Work to be done in W-11296404

describe('non-root templates without lwc directives', () => {
    it('should render text', () => {
        const elm = createElement('x-text', { is: NestedText });
        document.body.appendChild(elm);

        const expected = [{ nodeType: Node.TEXT_NODE, textContent: 'text' }];
        testTemplateRendering(expected, elm.shadowRoot.childNodes);
    });

    it('should render element', () => {
        const elm = createElement('x-element', { is: NestedElement });
        document.body.appendChild(elm);

        const expected = [
            { nodeType: Node.ELEMENT_NODE, tagName: 'SPAN', textContent: 'I am a span' },
        ];
        testTemplateRendering(expected, elm.shadowRoot.childNodes);
    });

    it('should preserve comments when lwc:preserve-comments is enabled', () => {
        const elm = createElement('x-comment', { is: Comment });
        document.body.appendChild(elm);

        const expected = [{ nodeType: Node.COMMENT_NODE, textContent: 'I am a comment' }];
        testTemplateRendering(expected, elm.shadowRoot.childNodes);
    });

    it('should flatten nested templates', () => {
        const elm = createElement('x-mixed', { is: Mixed });
        document.body.appendChild(elm);

        const expected = [
            { nodeType: Node.TEXT_NODE, textContent: 'before' },
            { nodeType: Node.ELEMENT_NODE, tagName: 'SPAN', textContent: 'middle' },
            { nodeType: Node.TEXT_NODE, textContent: 'after' },
        ];
        testTemplateRendering(expected, elm.shadowRoot.childNodes);
    });

    it('should flatten multiple template siblings', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        const expected = [
            { nodeType: Node.TEXT_NODE, textContent: 'Text' },
            { nodeType: Node.ELEMENT_NODE, tagName: 'SPAN', textContent: 'Span' },
            { nodeType: Node.ELEMENT_NODE, tagName: 'SPAN', textContent: 'Span #1' },
            { nodeType: Node.ELEMENT_NODE, tagName: 'SPAN', textContent: 'Span #2' },
            { nodeType: Node.TEXT_NODE, textContent: 'Before' },
            { nodeType: Node.ELEMENT_NODE, tagName: 'SPAN', textContent: 'Span #1' },
            { nodeType: Node.TEXT_NODE, textContent: 'Middle' },
            { nodeType: Node.ELEMENT_NODE, tagName: 'SPAN', textContent: 'Span #2' },
            { nodeType: Node.TEXT_NODE, textContent: 'After' },
        ];
        testTemplateRendering(expected, elm.shadowRoot.childNodes);
    });

    it('renders mixed LWC directives properly', () => {
        const elm = createElement('x-mixed-directive', { is: MixedDirective });
        elm.show = true;
        document.body.appendChild(elm);

        const expected = [
            { nodeType: Node.ELEMENT_NODE, tagName: 'LI', textContent: 'one' },
            { nodeType: Node.ELEMENT_NODE, tagName: 'LI', textContent: 'two' },
            { nodeType: Node.ELEMENT_NODE, tagName: 'LI', textContent: 'three' },
        ];
        testTemplateRendering(
            expected,
            Array.from(elm.shadowRoot.childNodes).filter((node) => node.textContent !== '')
        );
    });
});
