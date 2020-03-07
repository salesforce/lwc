import { createElement } from 'lwc';

import Test from 'x/test';
import IdMutations, { idSetterCounter, idRenderCounter, idGetterCounter } from 'x/idMutations';
import IdIsReactive, { renderCount as idIsReactiveRenderCount } from 'x/idIsReactive';
import IdSetInConstructor from 'x/idSetInConstructor';

describe('#id', () => {
    it('should reflect attribute by default', () => {
        const element = createElement('prop-reflect-id', { is: Test });
        element.id = 'id';
        expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'id')).toBe('id');
    });

    it('should return correct value from getter', () => {
        const element = createElement('prop-getter-id', { is: Test });
        element.id = 'id';
        expect(element.id).toBe('id');
    });

    it('should call setter defined in component', () => {
        const element = createElement('prop-setter-id', { is: IdMutations });
        element.id = 'id';
        expect(idSetterCounter).toBe(1);
    });

    it('should not be reactive when defining own setter', () => {
        const element = createElement('prop-setter-id-reactive', { is: IdMutations });
        document.body.appendChild(element);

        element.id = 'ltr';
        return Promise.resolve().then(() => {
            expect(idRenderCounter).toBe(1);
        });
    });

    it('should call getter defined in component', () => {
        const element = createElement('prop-getter-id-imperative', { is: IdMutations });

        expect(element.id).toBe('id');
        expect(idGetterCounter).toBe(1);
    });

    it('should be reactive by default', () => {
        const element = createElement('prop-id-reactive', { is: IdIsReactive });
        document.body.appendChild(element);

        element.id = 'id';
        return Promise.resolve().then(() => {
            expect(idIsReactiveRenderCount).toBe(2);
            expect(element.shadowRoot.querySelector('div').textContent).toBe('id');
        });
    });

    it('should throw an error when setting default value in constructor', () => {
        expect(() => {
            createElement('x-foo', { is: IdSetInConstructor });
        }).toThrowErrorDev(Error, /The result must not have attributes./);
    });
});
