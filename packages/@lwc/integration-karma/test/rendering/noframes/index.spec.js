import { createElement } from 'lwc';
import Component from 'x/component';

it('renders noframes correctly - W-16784305', async () => {
    const elm = createElement('x-component', { is: Component });
    document.body.appendChild(elm);

    await Promise.resolve();

    const {
        shadowRoot: { childNodes },
    } = elm;

    expect(childNodes.length).toBe(1);
    expect(childNodes[0].tagName).toBe('SECTION');
    expect(childNodes[0].childNodes.length).toBe(1);
    expect(childNodes[0].childNodes[0].tagName).toBe('NOFRAMES');
    expect(childNodes[0].childNodes[0].childNodes.length).toBe(1);
    expect(childNodes[0].childNodes[0].childNodes[0].tagName).toBe('DIV');
    expect(childNodes[0].childNodes[0].childNodes[0].childNodes.length).toBe(0);
    expect(childNodes[0].childNodes[0].childNodes[0].getAttribute('class')).toBe(
        '</noframes><span>whee</span>'
    );
});
