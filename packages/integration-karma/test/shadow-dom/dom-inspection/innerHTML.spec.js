import { createElement } from 'test-utils';

import Test from 'x/test';
import Complex from 'x/complexTemplate';

it('should enforce the shadow DOM semantic - x-test', () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);
    expect(elm.shadowRoot.innerHTML).toBe(
        '<x-container><div>Slotted Text</div></x-container>',
    );
});

it('should enforce the shadow DOM semantic - x-container', () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    const container = elm.shadowRoot.querySelector('x-container');
    expect(container.shadowRoot.innerHTML).toBe(
        '<div>Before[<slot></slot>]After</div>',
    );
});

it('should output attributes', () => {
    const elm = createElement('x-complex', { is: Complex });
    document.body.appendChild(elm);
    expect(elm.shadowRoot.querySelector('.with-attributes').innerHTML).toBe(
        '<span data-bar="bar"></span>',
    );
});

it('should output void elements properly', () => {
    const elm = createElement('x-complex', { is: Complex });
    document.body.appendChild(elm);
    expect(elm.shadowRoot.querySelector('.with-void-elements').innerHTML).toBe(
        '<div><input name="foo"><hr></div>',
    );
});

it('should output text properly', () => {
    const elm = createElement('x-complex', { is: Complex });
    document.body.appendChild(elm);
    expect(elm.shadowRoot.querySelector('.with-text').innerHTML).toBe(
        '<span>Foo Bar</span>',
    );
});
