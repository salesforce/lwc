import { createElement } from 'lwc';
import Foo from 'c/foo';
import Bar from 'c/bar';

describe('template inheritance', () => {
    it('should support implicit definition of new template', function () {
        const elm = createElement('c-foo', { is: Foo });
        document.body.appendChild(elm);

        const text = elm.shadowRoot.textContent;
        expect(text).toBe('foo');
    });
    it('should support implicit definition of no template', function () {
        const elm = createElement('c-bar', { is: Bar });
        document.body.appendChild(elm);

        const text = elm.shadowRoot.textContent;
        expect(text).toBe('base');
    });
});
