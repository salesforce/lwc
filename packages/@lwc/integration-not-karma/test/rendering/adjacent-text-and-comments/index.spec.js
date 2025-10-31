import { createElement } from 'lwc';
import Preserve from 'c/preserve';
import Ignore from 'c/ignore';

it('renders adjacent text/comments without lwc:preserve-comments', async () => {
    const elm = createElement('c-ignore', { is: Ignore });
    document.body.appendChild(elm);

    await Promise.resolve();
    const span = elm.shadowRoot.querySelector('span');

    // one text node exactly
    expect(span.childNodes.length).toBe(1);
    expect(span.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
    expect(span.childNodes[0].nodeValue).toBe('');
});

it('renders adjacent text/comments with lwc:preserve-comments', async () => {
    const elm = createElement('c-preserve', { is: Preserve });
    document.body.appendChild(elm);

    await Promise.resolve();
    const span = elm.shadowRoot.querySelector('span');

    // multiple comment and text nodes
    expect(span.childNodes.length).toBe(5);
    expect([...span.childNodes].map((_) => _.nodeType)).toEqual([
        Node.COMMENT_NODE,
        Node.TEXT_NODE,
        Node.COMMENT_NODE,
        Node.TEXT_NODE,
        Node.COMMENT_NODE,
    ]);
    expect([...span.childNodes].map((_) => _.nodeValue)).toEqual([
        ' yolo ',
        '',
        ' yolo ',
        '',
        ' yolo ',
    ]);
});
