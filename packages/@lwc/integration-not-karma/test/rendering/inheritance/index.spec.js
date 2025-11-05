import { createElement } from 'lwc';
import Foo from 'x/foo';
import Bar from 'x/bar';

describe('template inheritance', () => {
    it('should support implicit definition of new template', function () {
        const elm = createElement('x-foo', { is: Foo });
        document.body.appendChild(elm);

        const text = elm.shadowRoot.textContent;
        expect(text).toBe('foo');
    });
    it('should support implicit definition of no template', function () {
        const elm = createElement('x-bar', { is: Bar });
        document.body.appendChild(elm);

        const text = elm.shadowRoot.textContent;
        expect(text).toBe('base');
    });
});
