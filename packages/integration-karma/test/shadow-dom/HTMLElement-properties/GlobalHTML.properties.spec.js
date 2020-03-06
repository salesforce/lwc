import { createElement } from 'lwc';

import Test from 'x/test';

describe('global HTML Properties', () => {
    it('should always return null', () => {
        const elm = createElement('x-foo', { is: Test });
        elm.setAttribute('title', 'cubano');
        const cmp = elm.componentInstance;
        expect(cmp.getAttribute('title')).toBeNull();
    });

    /* it('should set user specified value during setAttribute call', () => {
        let userDefinedTabIndexValue = -1;
        class MyComponent extends LightningElement {
            renderedCallback() {
                userDefinedTabIndexValue = this.getAttribute('tabindex');
            }
        }
        const elm = createElement('x-foo', { is: MyComponent });
        elm.setAttribute('tabindex', '0');
        document.body.appendChild(elm);

        expect(userDefinedTabIndexValue).toBe('0');
    }),
        it('should not throw when accessing attribute in root elements', () => {
            class Parent extends LightningElement {}
            const elm = createElement('x-foo', { is: Parent });
            document.body.appendChild(elm);
            elm.setAttribute('tabindex', 1);
        });

    it('should delete existing attribute prior rendering', () => {
        const def = class MyComponent extends LightningElement {};
        const elm = createElement('x-foo', { is: def });
        elm.setAttribute('title', 'parent title');
        elm.removeAttribute('title');
        document.body.appendChild(elm);

        expect(elm.getAttribute('title')).not.toBe('parent title');
    }); */
});
