import { createElement } from 'lwc';
import XTest from 'x/test';

it('directive if:true', () => {
    const elm = createElement('x-test', { is: XTest });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('p')).toBeNull();

    elm.isVisible = true;
    return Promise.resolve()
        .then(() => {
            const paragraph = elm.shadowRoot.querySelector('p');
            expect(paragraph).not.toBeNull();
            expect(paragraph.textContent).toBe('I am visible!');

            elm.isVisible = false;
        })
        .then(() => {
            expect(elm.shadowRoot.querySelector('p')).toBeNull();
        });
});
