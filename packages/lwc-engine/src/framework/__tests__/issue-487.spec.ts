import { createElement, LightningElement } from '../main';

describe('issue 487', () => {
    it('should not throw when setting AOM property on anchor', () => {
        class MyComponent extends LightningElement {
            setAriaSelected() {
                this.template.querySelector('a').ariaSelected = 'true';
            }
            render() {
                return function ($api, $cmp) {
                    return [
                        $api.h('a', { key: 0 }, []),
                    ]
                }
            }
        }

        MyComponent.publicMethods = ['setAriaSelected'];

        const element = createElement('x-foo', { is: MyComponent }) as HTMLAnchorElement;
        document.body.appendChild(element);
        element.href = 'https://google.com';
        expect(() => {
            element.setAriaSelected();
        }).not.toThrow();
    });
});
