import { createElement } from 'test-utils';

import Test from 'x/test';
import Complex from 'x/complexTemplate';

it('should enforce the shadow DOM semantic - x-test', () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    const container = elm.shadowRoot.querySelector('x-container');
    expect(container.outerHTML).toBe(
        '<x-container><div>Slotted Text</div></x-container>',
    );
});

it('should enforce the shadow DOM semantic - x-container', () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    const container = elm.shadowRoot.querySelector('x-container');
    expect(container.shadowRoot.querySelector('div').outerHTML).toBe(
        '<div>Before[<slot></slot>]After</div>',
    );
});

it('should output attributes', () => {
    const elm = createElement('x-complex', { is: Complex });
    document.body.appendChild(elm);
    expect(elm.shadowRoot.querySelector('.with-attributes').outerHTML).toBe(
        '<div class="with-attributes"><span data-bar="bar"></span></div>',
    );
});

it('should output properly void elements', () => {
    const elm = createElement('x-complex', { is: Complex });
    document.body.appendChild(elm);
    expect(elm.shadowRoot.querySelector('.with-void-elements').outerHTML).toBe(
        '<div class="with-void-elements"><div><input name="foo"><hr></div></div>',
    );
});

it('should output properly text', () => {
    const elm = createElement('x-complex', { is: Complex });
    document.body.appendChild(elm);
    expect(elm.shadowRoot.querySelector('.with-text').outerHTML).toBe(
        '<div class="with-text"><span>Foo Bar</span></div>',
    );
});
