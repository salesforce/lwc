import { createElement } from 'lwc';
import Component from 'c/component';

it('renders noframes correctly - W-16784305', async () => {
    const elm = createElement('c-component', { is: Component });
    document.body.appendChild(elm);

    await Promise.resolve();

    const {
        shadowRoot: { childNodes },
    } = elm;

    expect(childNodes.length).toBe(1);

    const section = childNodes[0];
    expect(section.tagName).toBe('SECTION');
    expect(section.childNodes.length).toBe(3);

    const [first, second, third] = section.childNodes;

    expect(first.tagName).toBe('NOFRAMES');
    expect(first.textContent).toBe('<div class="');

    expect(second.tagName).toBe('SPAN');
    expect(second.textContent).toBe('whee');

    expect(third.nodeType).toBe(Node.TEXT_NODE);
    expect(third.nodeValue).toBe('"></div> </noframes>');
});
