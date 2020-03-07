import { createElement } from 'lwc';

import Test from 'x/test';
import DirMutations, { dirSetterCounter, dirRenderCounter, dirGetterCounter } from 'x/dirMutations';
import DirIsReactive, { renderCount as dirIsReactiveRenderCount } from 'x/dirIsReactive';
import DirSetInConstructor from 'x/dirSetInConstructor';

describe('#dir', () => {
    it('should reflect attribute by default', () => {
        const element = createElement('prop-reflect-dir', { is: Test });
        element.dir = 'ltr';
        expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'dir')).toBe('ltr');
    });

    it('should return correct value from getter', () => {
        const element = createElement('prop-getter-dir', { is: Test });
        element.dir = 'ltr';
        expect(element.dir).toBe('ltr');
    });

    it('should call setter defined in component', () => {
        const element = createElement('prop-setter-dir', { is: DirMutations });
        element.dir = 'ltr';

        expect(dirSetterCounter).toBe(1);
    });

    it('should not be reactive when defining own setter', () => {
        const element = createElement('prop-setter-dir-reactive', { is: DirMutations });
        document.body.appendChild(element);

        element.dir = 'ltr';
        return Promise.resolve().then(() => {
            expect(dirRenderCounter).toBe(1);
        });
    });

    it('should call getter defined in component', () => {
        const element = createElement('prop-getter-dir-imperative', { is: DirMutations });

        expect(element.dir).toBe('ltr');
        expect(dirGetterCounter).toBe(1);
    });

    it('should be reactive by default', () => {
        const element = createElement('prop-dir-reactive', { is: DirIsReactive });
        document.body.appendChild(element);

        element.dir = 'ltr';
        return Promise.resolve().then(() => {
            expect(dirIsReactiveRenderCount).toBe(2);
            expect(element.shadowRoot.querySelector('div').textContent).toBe('ltr');
        });
    });

    it('should throw an error when setting default value in constructor', () => {
        expect(() => {
            createElement('x-foo', { is: DirSetInConstructor });
        }).toThrowError(/The result must not have attributes./);
    });
});
