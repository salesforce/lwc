import { createElement } from 'lwc';
import Component from 'c/component';

it('should render style containing newline - issue #4579', async () => {
    const elm = createElement('c-component', { is: Component });
    document.body.appendChild(elm);

    await Promise.resolve();

    const div = elm.shadowRoot.querySelector('div');
    expect(div.style.color).toBe('yellow');

    const span = elm.shadowRoot.querySelector('span');
    expect(span.style.color).toBe('purple');
    expect(span.style.backgroundColor).toBe('orange');
});
