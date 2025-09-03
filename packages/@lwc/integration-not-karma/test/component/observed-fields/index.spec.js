import { createElement, LightningElement } from 'lwc';

import Simple from 'x/simple';
import SideEffect from 'x/fieldWithSideEffect';
import FieldForCache from 'x/fieldForCache';

import duplicatePropertyTemplate from 'x/duplicatePropertyTemplate';

describe('observed-fields', () => {
    it('should rerender component when field is mutated', () => {
        const elm = createElement('x-simple', { is: Simple });
        document.body.appendChild(elm);

        elm.setValue('simpleValue', 'mutated');
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('.simple-value').textContent).toBe('mutated');
        });
    });

    it('should not rerender component when expando field is mutated', () => {
        const elm = createElement('x-simple', { is: Simple });
        document.body.appendChild(elm);

        elm.setValue('expandoField', 'mutated');
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('.expando-value').textContent).toBe('initial');
        });
    });

    it('should preserve object identity when saving object in fields', () => {
        const elm = createElement('x-simple', { is: Simple });
        document.body.appendChild(elm);

        const testObj = { name: 'jonh', lastName: 'doe' };

        elm.setValue('trackedField', testObj);
        elm.setValue('complexValue', testObj);

        expect(elm.getValue('trackedField')).not.toBe(testObj);
        expect(elm.getValue('complexValue')).toBe(testObj);
    });

    it('should not rerender component when field value is mutated', () => {
        const elm = createElement('x-simple', { is: Simple });
        document.body.appendChild(elm);

        elm.mutateComplexValue();

        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('.complex-value').textContent).toBe('foo-bar');

            // will trigger a rerender and will render the mutated complex values
            elm.setValue('simpleValue', 'mutated');

            return Promise.resolve().then(() => {
                expect(elm.shadowRoot.querySelector('.complex-value').textContent).toBe(
                    'mutated name-mutated lastName'
                );
            });
        });
    });

    it('should have same behavior as an expando field when has side effects during render', () => {
        const elm = createElement('x-side-effect', { is: SideEffect });
        const elmUsingExpando = createElement('x-side-effect', { is: SideEffect });
        elmUsingExpando.useExpando = true;

        elm.label = 'label txt';
        elmUsingExpando.label = 'label txt';

        document.body.appendChild(elm);
        document.body.appendChild(elmUsingExpando);

        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('.label').textContent).toBe('label txt');
            expect(elm.shadowRoot.querySelector('.rendered-times').textContent).toBe('1');
            expect(elmUsingExpando.shadowRoot.querySelector('.expando').textContent).toBe('1');

            elm.label = 'label modified';
            elmUsingExpando.label = 'label modified';
            return Promise.resolve().then(() => {
                expect(elm.shadowRoot.querySelector('.label').textContent).toBe('label modified');
                expect(elm.shadowRoot.querySelector('.rendered-times').textContent).toBe('2');
                expect(elmUsingExpando.shadowRoot.querySelector('.expando').textContent).toBe('2');
            });
        });
    });

    it('should not throw when has side effects in a getter during render', () => {
        const elm = createElement('x-field-for-cache', { is: FieldForCache });
        elm.label = 'label txt';

        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('.label').textContent).toBe('label txt');
            expect(elm.shadowRoot.querySelector('.computedLabel').textContent).toBe(
                'label txt computed'
            );

            elm.label = 'label modified';
            return Promise.resolve().then(() => {
                expect(elm.shadowRoot.querySelector('.label').textContent).toBe('label modified');
                expect(elm.shadowRoot.querySelector('.computedLabel').textContent).toBe(
                    'label txt computed'
                );
            });
        });
    });

    it('should rerender component when inherited field is mutated', () => {
        const elm = createElement('x-simple', { is: Simple });
        document.body.appendChild(elm);

        elm.setValue('inheritedValue', 'mutated');
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('.inherited-value').textContent).toBe('mutated');
        });
    });

    it('should allow decorated reserved words as field names', () => {
        const elm = createElement('x-simple', { is: Simple });
        elm.static = 'static value';
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.static-value').textContent).toBe('static value');
        elm.static = 'static value modified';

        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('.static-value').textContent).toBe(
                'static value modified'
            );
        });
    });

    describe('restrictions', () => {
        it('logs a property error when a reactive field conflicts with a method', () => {
            expect(() => {
                // The following class is wrapped by the compiler with registerDecorators. We check
                // here if the fields are validated properly.
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                class Invalid extends LightningElement {
                    showFeatures;
                    // eslint-disable-next-line no-dupe-class-members
                    showFeatures() {}
                }
            }).toLogErrorDev(
                /Invalid observed showFeatures field\. Found a duplicate method with the same name\./
            );
        });
    });
});

describe('regression [W-9927596] - observed field with duplicate accessor', () => {
    it('log errors when evaluated and should not invoke the accessors', () => {
        let Ctor;
        const accessors = [];

        expect(() => {
            class DuplicateAccessor extends LightningElement {
                foo = 'default';

                // eslint-disable-next-line no-dupe-class-members
                set foo(value) {
                    accessors.push(`setter ${value}`);
                    this._foo = value;
                }
                // eslint-disable-next-line no-dupe-class-members
                get foo() {
                    accessors.push('getter');
                    return this._foo;
                }

                render() {
                    return duplicatePropertyTemplate;
                }
            }

            Ctor = DuplicateAccessor;
        }).toLogErrorDev(
            /Invalid observed foo field\. Found a duplicate accessor with the same name\./
        );

        const elm = createElement('x-duplicate-accessor', { is: Ctor });

        document.body.appendChild(elm);

        expect(accessors).toEqual([]);
        expect(elm.shadowRoot.querySelector('p').textContent).toBe('default');
    });
});
