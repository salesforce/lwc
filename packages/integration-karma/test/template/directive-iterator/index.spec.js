import { createElement } from 'lwc';
import XTest from 'x/test';

it('should render each item and index', () => {
    const elm = createElement('x-test', { is: XTest });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('ul').childElementCount).toBe(0);
    elm.items = ['one', 'two', 'three'];

    return Promise.resolve()
        .then(() => {
            const ul = elm.shadowRoot.querySelector('ul');
            expect(ul.childElementCount).toBe(3);
            expect(ul.children[0].textContent).toBe('0 - one');
            expect(ul.children[1].textContent).toBe('1 - two');
            expect(ul.children[2].textContent).toBe('2 - three');

            elm.items = [];
        })
        .then(() => {
            expect(
                elm.shadowRoot.querySelector('ul').childElementCount,
            ).toBe(0);
        });
});

it('should set first and last', () => {
    const elm = createElement('x-test', { is: XTest });
    elm.items = ['one', 'two', 'three'];
    document.body.appendChild(elm);

    const ul = elm.shadowRoot.querySelector('ul');
    expect({ ...ul.children[0].dataset }).toEqual({ isFirst: 'true', isLast: 'false' });
    expect({ ...ul.children[1].dataset }).toEqual({ isFirst: 'false', isLast: 'false' });
    expect({ ...ul.children[2].dataset }).toEqual({ isFirst: 'false', isLast: 'true' });
});
