import { createElement } from 'test-utils';
import XTest from 'x/test';

it('should render static className properly', () => {
    const elm = createElement('x-test', { is: XTest });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('[data-static-class]').className).toBe('foo bar');
});

it('should render dynamic className properly', () => {
    const elm = createElement('x-test', { is: XTest });
    elm.dynamicClass = 'bar foo'
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('[data-dynamic-class]').className).toBe('bar foo');
});

it('should update if the dynamic className change', () => {
    const elm = createElement('x-test', { is: XTest });
    elm.dynamicClass = '';
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('[data-dynamic-class]').className).toBe('');
    elm.dynamicClass = 'bar foo';

    return Promise.resolve().then(() => {
        expect(elm.shadowRoot.querySelector('[data-dynamic-class]').className).toBe('bar foo');
    });
});
