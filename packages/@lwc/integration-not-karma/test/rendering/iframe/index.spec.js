import { createElement } from 'lwc';
import Component from 'c/component';
import { spyOn } from '@vitest/spy';

let spy;

beforeEach(() => {
    spy = spyOn(Element.prototype, 'setAttribute');
});

it('renders iframes correctly - W-17015807', async () => {
    const elm = createElement('c-component', { is: Component });
    document.body.appendChild(elm);

    await Promise.resolve();

    expect(spy).toHaveBeenCalledExactlyOnceWith('src', 'about:blank');
});
