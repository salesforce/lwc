import { createElement } from 'lwc';
import Container from 'x/dynamic';
import DynamicCtor from 'x/ctor';
import { registerForLoad, clearRegister } from 'test-utils';

beforeEach(() => {
    clearRegister();
});

it('should call the loader', () => {
    registerForLoad('x-ctor', DynamicCtor);

    const elm = createElement('x-dynamic', { is: Container });
    document.body.appendChild(elm);

    return Promise.resolve().then(() => {
        const span = elm.shadowRoot.querySelector('span');
        expect(span).not.toBeNull();
        expect(span.textContent).toBe('ctor_html');
    });
});
