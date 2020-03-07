import { createElement } from 'lwc';

import CustomInstanceSetter from 'x/customInstanceSetter';

describe('#data layer', () => {
    it('should allow custom instance getter and setter', () => {
        const elm = createElement('x-foo', { is: CustomInstanceSetter });
        elm.foo = 1;
        document.body.appendChild(elm);
        elm.setFoo();
        elm.foo = 2;

        expect(elm.setterValue).toBe(2);
        expect(elm.setterContext).toBe(elm.componentInstance);
    });
});
