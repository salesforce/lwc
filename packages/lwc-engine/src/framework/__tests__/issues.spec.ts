import { createElement, Element } from '../main';

describe('issue', () => {

    beforeEach(() => {
        document.body.innerHTML = '';
    });

    describe('#180: data attributes normalization', () => {

        it('should support data-foo attribute', () => {
            class MyComponent extends Element {
                connectedCallback() {
                    expect(this.getAttribute('data-foo')).toBe("miami");
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            elm.setAttribute('data-foo', 'miami');
            document.body.appendChild(elm);
            expect(elm.getAttribute('data-foo')).toBe('miami');
        });

        it('should not allow dataFoo public api property', () => {
            class MyComponent extends Element {}
            MyComponent.publicProps = { dataFoo: { config: 1 } };
            expect(() => {
                createElement('x-foo', { is: MyComponent });
            }).toThrow();
        });

    });
});
