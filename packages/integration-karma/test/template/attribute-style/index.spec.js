import { createElement } from 'lwc';
import XTest from 'x/test';

it('should render static style properly', () => {
    const elm = createElement('x-test', { is: XTest });
    document.body.appendChild(elm);

    const style = window.getComputedStyle(elm.shadowRoot.querySelector('[data-static-style]'));
    expect(style.padding).toBe('10px');
});

it('should render dynamic style properly', () => {
    const elm = createElement('x-test', { is: XTest });
    elm.dynamicStyle = 'margin: 10px;';
    document.body.appendChild(elm);

    const style = window.getComputedStyle(elm.shadowRoot.querySelector('[data-dynamic-style]'));
    expect(style.margin).toBe('10px');
});

it('should update if the dynamic style change', () => {
    const elm = createElement('x-test', { is: XTest });
    elm.dynamicStyle = 'margin: 20px;';
    document.body.appendChild(elm);

    const style = window.getComputedStyle(elm.shadowRoot.querySelector('[data-dynamic-style]'));
    expect(style.margin).toBe('20px');

    elm.dynamicStyle = 'margin: 10px;';

    return Promise.resolve().then(() => {
        const style = window.getComputedStyle(elm.shadowRoot.querySelector('[data-dynamic-style]'));
        expect(style.margin).toBe('10px');
    });
});

