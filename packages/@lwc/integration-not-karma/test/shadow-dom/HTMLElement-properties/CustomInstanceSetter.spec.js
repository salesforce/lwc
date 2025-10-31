import { createElement } from 'lwc';

import CustomInstanceSetter from 'c/customInstanceSetter';

describe('accessing public properties defined on component', () => {
    it('should allow redefining a public property on component instance', () => {
        const elm = createElement('c-foo', { is: CustomInstanceSetter });
        elm.foo = 1;
        document.body.appendChild(elm);
        elm.setFoo();
        elm.foo = 2;

        expect(elm.setterValue).toBe(2);
        expect(elm.setterContext).toBe(elm.componentInstance);
    });
});
