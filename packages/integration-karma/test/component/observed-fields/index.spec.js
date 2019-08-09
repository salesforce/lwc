import { createElement } from 'lwc';

import Simple from 'x/simple';
import SideEffect from './x/fieldWithSideEffect/fieldWithSideEffect';

describe('observable-fields', () => {
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

    it('should throw when updating field during render', () => {
        const elm = createElement('x-side-effect', { is: SideEffect });

        expect(() => {
            document.body.appendChild(elm);
        }).toThrowErrorDev(
            Error,
            /Invariant Violation: \[.+\]\.render\(\) method has side effects on the state of "counter" field/
        );
    });

    it('should rerender component when inherited field is mutated', () => {
        const elm = createElement('x-simple', { is: Simple });
        document.body.appendChild(elm);

        elm.setValue('inheritedValue', 'mutated');
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('.inherited-value').textContent).toBe('mutated');
        });
    });
});
