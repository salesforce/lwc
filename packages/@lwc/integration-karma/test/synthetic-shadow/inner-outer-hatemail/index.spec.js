import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';
import Inner from 'x/inner';

beforeAll(() => {
    customElements.define('omg-whatever', class extends HTMLElement {});
});

let consoleSpy;
beforeEach(() => {
    consoleSpy = spyOn(console, 'warn');
});

fit('does not render content from attributes', async () => {
    const elm = createElement('x-inner', { is: Inner });
    document.body.appendChild(elm);
    await Promise.resolve();

    const ids = extractDataIds(elm);
    for (const [_, node] of Object.entries(ids)) {
        expect(node.childNodes.length).toBe(1);
        expect(node.firstChild.nodeType).toBe(Node.TEXT_NODE);
        expect(node.firstChild.nodeValue).toBe('original');
    }
    expect(consoleSpy).toHaveBeenCalledWith(
        'Cannot set property "innerHTML". Instead, use lwc:inner-html or lwc:dom-manual.'
    );
    expect(consoleSpy).toHaveBeenCalledTimes(Object.keys(ids).length);
});
