import { createElement } from 'lwc';

import Test from 'x/test';
import TitleMutations, {
    titleSetterCounter,
    titleRenderCounter,
    titleGetterCounter,
} from 'x/titleMutations';
import TitleIsReactive, { renderCount as titleIsReactiveRenderCount } from 'x/titleIsReactive';
import TitleSetInConstructor from 'x/titleSetInConstructor';

describe('#title', () => {
    it('should reflect attribute by default', () => {
        const element = createElement('prop-reflect-title', { is: Test });
        element.title = 'title';
        expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'title')).toBe('title');
    });

    it('should return correct value from getter', () => {
        const element = createElement('prop-getter-title', { is: Test });
        element.title = 'title';
        expect(element.title).toBe('title');
    });

    it('should call setter defined in component', () => {
        const element = createElement('prop-setter-title', { is: TitleMutations });
        (element.title = {}), expect(titleSetterCounter).toBe(1);
    });

    it('should not be reactive when defining own setter', () => {
        const element = createElement('prop-setter-title-reactive', { is: TitleMutations });
        document.body.appendChild(element);

        element.title = 'title';
        return Promise.resolve().then(() => {
            expect(titleRenderCounter).toBe(1);
        });
    });

    it('should call getter defined in component', () => {
        const element = createElement('prop-getter-title-imperative', { is: TitleMutations });

        expect(element.title).toBe('title');
        expect(titleGetterCounter).toBe(1);
    });

    it('should be reactive by default', () => {
        const element = createElement('prop-title-reactive', { is: TitleIsReactive });
        document.body.appendChild(element);

        element.title = 'title';
        return Promise.resolve().then(() => {
            expect(titleIsReactiveRenderCount).toBe(2);
            expect(element.shadowRoot.querySelector('div').textContent).toBe('title');
        });
    });

    it('should throw an error when setting default value in constructor', () => {
        expect(() => {
            createElement('x-foo', { is: TitleSetInConstructor });
        }).toThrowErrorDev(Error, /The result must not have attributes./);
    });
});
