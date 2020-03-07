import { createElement } from 'lwc';

import Test from 'x/test';
import HiddenMutations, {
    hiddenSetterCounter,
    hiddenRenderCounter,
    hiddenGetterCounter,
} from 'x/hiddenAttrMutations';
import HiddenIsReactive, { renderCount as hiddenIsReactiveRenderCount } from 'x/hiddenIsReactive';
import HiddenSetInConstructor from 'x/hiddenSetInConstructor';

describe('#hidden', () => {
    it('should reflect attribute by default', () => {
        const element = createElement('prop-reflect-hidden', { is: Test });
        element.hidden = true;
        expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'hidden')).toBe('');
    });

    it('should return correct value from getter', () => {
        const element = createElement('prop-getter-hidden', { is: Test });
        element.hidden = true;
        expect(element.hidden).toBe(true);
    });

    it('should call setter defined in component', () => {
        const element = createElement('prop-setter-hidden', { is: HiddenMutations });
        element.hidden = true;

        expect(hiddenSetterCounter).toBe(1);
    });

    it('should not be reactive when defining own setter', () => {
        const element = createElement('prop-setter-hidden-reactive', { is: HiddenMutations });
        document.body.appendChild(element);

        element.hidden = true;
        return Promise.resolve().then(() => {
            expect(hiddenRenderCounter).toBe(1);
        });
    });

    it('should call getter defined in component', () => {
        const element = createElement('prop-getter-hidden-imperative', { is: HiddenMutations });

        expect(element.hidden).toBe('hidden');
        expect(hiddenGetterCounter).toBe(1);
    });

    it('should be reactive by default', () => {
        const element = createElement('prop-hidden-reactive', { is: HiddenIsReactive });
        document.body.appendChild(element);

        element.hidden = true;
        return Promise.resolve().then(() => {
            expect(hiddenIsReactiveRenderCount).toBe(2);
            expect(element.shadowRoot.querySelector('div').textContent).toBe('true');
        });
    });

    it('should throw an error when setting default value in constructor', () => {
        expect(() => {
            createElement('x-foo', { is: HiddenSetInConstructor });
        }).toThrowErrorDev(Error, /The result must not have attributes./);
    });
});
