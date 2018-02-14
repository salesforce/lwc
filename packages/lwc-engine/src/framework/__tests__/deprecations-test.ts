import { Element } from "../main";
import { createElement } from "../upgrade";

describe('deprecation', () => {
    describe('Element', () => {
        it('should still be able to extend Element', () => {
            class MyComponent extends Element {
                setFoo() {
                    this.setAttributeNS('x', 'foo', 'bar');
                }
            }
            MyComponent.publicMethods = ['setFoo'];
            const element = createElement('x-foo', { is: MyComponent });
            expect(typeof element.setFoo).toBe('function');
        });
    });

});
