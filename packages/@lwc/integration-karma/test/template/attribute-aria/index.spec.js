import { createElement } from 'lwc';
import { ariaAttributes, ariaProperties, ariaPropertiesMapping } from 'test-utils';

import Parent from 'x/parent';

describe('setting aria attributes', () => {
    let childComponent;
    let childDiv;

    beforeEach(() => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);

        childComponent = elm.shadowRoot.querySelector('x-child');
        childDiv = elm.shadowRoot.querySelector('div');
    });

    describe('on a component', () => {
        function testAriaPropertyEquals(prop, expectedValue) {
            // four cases:
            // 1. prop outside
            // 2. prop inside
            // 3. attribute outside
            // 4. attribute inside
            expect(childComponent[prop]).toEqual(expectedValue);
            expect(childComponent.callPropertyGetter(prop)).toEqual(expectedValue);
            expect(childComponent.getAttribute(ariaPropertiesMapping[prop])).toEqual(expectedValue);
            expect(childComponent.callGetAttribute(ariaPropertiesMapping[prop])).toEqual(
                expectedValue
            );
        }

        it('attribute is set', () => {
            for (const attrName of ariaAttributes) {
                expect(childComponent.getAttribute(attrName)).toMatch(/^foo/);
            }
        });

        it('component can use this.aria* property accessors', () => {
            const privateAriaProperties = childComponent.getAllAriaProps();
            expect(Object.keys(privateAriaProperties)).toEqual(ariaProperties);
            for (const prop of ariaProperties) {
                expect(privateAriaProperties[prop]).toMatch(/^foo/);
            }
        });

        it('can get aria prop from outside the component', () => {
            for (const prop of ariaProperties) {
                expect(childComponent[prop]).toMatch(/^foo/);
            }
        });

        it('can mutate aria prop from outside the component', () => {
            for (const prop of ariaProperties) {
                childComponent[prop] = 'bar';
                testAriaPropertyEquals(prop, 'bar');
            }
        });

        it('can mutate aria prop from inside the component', () => {
            childComponent.setAllAriaProps('bar');
            for (const prop of ariaProperties) {
                testAriaPropertyEquals(prop, 'bar');
            }
        });
    });

    describe('on a div', () => {
        it('attribute is set', () => {
            for (const attrName of ariaAttributes) {
                expect(childDiv.getAttribute(attrName)).toMatch(/^foo/);
            }
        });

        // If the polyfill is not enabled, then we can't expect the div to have all the ARIA properties,
        // because some are non-standard or not supported in all browsers
        if (process.env.ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL) {
            it('aria prop is set', () => {
                for (const prop of ariaProperties) {
                    expect(childComponent[prop]).toMatch(/^foo/);
                }
            });
        }
    });
});
