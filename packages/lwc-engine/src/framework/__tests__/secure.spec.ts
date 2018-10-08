import { createElement, LightningElement } from '../main';

describe('secure', () => {
    it('forbidden access to template', () => {
        // We can't use the inline template compiler here
        // since precisely we are trying to test that handcrafted
        // functions throw an exception.
        function html() {
            return [];
        }

        class Foo extends LightningElement {
            render() {
                return html;
            }
        }
        const elm = createElement('x-foo', { is: Foo });
        expect(() => {
            document.body.appendChild(elm);
        }).toThrowError('The template rendered by [object:vm Foo (1)] must return an imported template tag (e.g.: `import html from "./Foo.html"`) or undefined, instead, it has returned a function');
    });
});
