import { createElement } from 'lwc';

import CustomInstanceSetter from 'x/customInstanceSetter';

describe('accessing public properties defined on component', () => {
    it('should allow redefining a public property on component instance', () => {
        const elm = createElement('x-foo', { is: CustomInstanceSetter });
        elm.foo = 1;
        document.body.appendChild(elm);
        elm.setFoo();
        elm.foo = 2;

        expect(elm.setterValue).toBe(2);
        expect(elm.setterContext).toBe(elm.componentInstance);
    });
});
