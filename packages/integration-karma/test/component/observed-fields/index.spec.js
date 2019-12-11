import { createElement } from 'lwc';

import Simple from 'x/simple';
import SideEffect from './x/fieldWithSideEffect/fieldWithSideEffect';
import FieldForCache from './x/fieldForCache/fieldForCache';

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
});
