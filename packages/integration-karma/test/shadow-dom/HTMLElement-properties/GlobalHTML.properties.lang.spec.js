import { createElement } from 'lwc';

import Test from 'x/test';
import LangMutations, {
    langSetterCounter,
    langRenderCounter,
    langGetterCounter,
} from 'x/langMutations';
import LangIsReactive, { renderCount as langIsReactiveRenderCount } from 'x/langIsReactive';
import LangSetInConstructor from 'x/langSetInConstructor';

describe('#lang', () => {
    it('should reflect attribute by default', () => {
        const element = createElement('prop-reflect-lang', { is: Test });
        element.lang = 'en';
        expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'lang')).toBe('en');
    });

    it('should return correct value from getter', () => {
        const element = createElement('prop-getter-lang', { is: Test });
        element.lang = 'en';
        expect(element.lang).toBe('en');
    });

    it('should call setter defined in component', () => {
        const element = createElement('prop-setter-lang', { is: LangMutations });
        element.lang = 'en';

        expect(langSetterCounter).toBe(1);
    });

    it('should not be reactive when defining own setter', () => {
        const element = createElement('prop-setter-lang-reactive', { is: LangMutations });
        document.body.appendChild(element);

        element.lang = 'en';
        return Promise.resolve().then(() => {
            expect(langRenderCounter).toBe(1);
        });
    });

    it('should call getter defined in component', () => {
        const element = createElement('prop-getter-lang-imperative', { is: LangMutations });

        expect(element.lang).toBe('lang');
        expect(langGetterCounter).toBe(1);
    });

    it('should be reactive by default', () => {
        const element = createElement('prop-lang-reactive', { is: LangIsReactive });
        document.body.appendChild(element);

        element.lang = 'en';
        return Promise.resolve().then(() => {
            expect(langIsReactiveRenderCount).toBe(2);
            expect(element.shadowRoot.querySelector('div').textContent).toBe('en');
        });
    });

    it('should throw an error when setting default value in constructor', () => {
        expect(() => {
            createElement('x-foo', { is: LangSetInConstructor });
        }).toThrowErrorDev(Error, /The result must not have attributes./);
    });
});
