import { createElement } from 'lwc';
import Component from 'x/component';

let spy;

beforeEach(() => {
    spy = spyOn(Element.prototype, 'setAttribute');
});

it('renders iframes correctly - W-17015807', async () => {
    const elm = createElement('x-component', { is: Component });
    document.body.appendChild(elm);

    await Promise.resolve();

    expect(spy).toHaveBeenCalledOnceWith('src', 'about:blank');
});
