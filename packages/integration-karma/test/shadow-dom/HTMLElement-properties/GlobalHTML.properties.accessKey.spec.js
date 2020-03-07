import { createElement } from 'lwc';

import Test from 'x/test';
import AccessKeyMutations, {
    accessKeySetterCounter,
    accessKeyRenderCounter,
    accessKeyGetterCounter,
} from 'x/accessKeyMutations';
import AccessKeyIsReactive, {
    renderCount as accessKeyIsReactiveRenderCount,
} from 'x/accessKeyIsReactive';
import AccesskeySetInConstructor from 'x/accessKeySetInConstructor';

describe('#accessKey', () => {
    it('should reflect attribute by default', () => {
        const element = createElement('prop-reflect-accessKey', { is: Test });
        element.accessKey = 'accessKey';
        expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'accesskey')).toBe(
            'accessKey'
        );
    });

    it('should return correct value from getter', () => {
        const element = createElement('prop-getter-accessKey', { is: Test });
        element.accessKey = 'accessKey';
        expect(element.accessKey).toBe('accessKey');
    });

    it('should call setter defined in component', () => {
        const element = createElement('prop-setter-accessKey', { is: AccessKeyMutations });
        element.accessKey = 'accessKey';

        expect(accessKeySetterCounter).toBe(1);
    });

    it('should not be reactive when defining own setter', () => {
        const element = createElement('prop-setter-accessKey-reactive', {
            is: AccessKeyMutations,
        });
        document.body.appendChild(element);

        element.accessKey = 'accessKey';
        return Promise.resolve().then(() => {
            expect(accessKeyRenderCounter).toBe(1);
        });
    });

    it('should call getter defined in component', () => {
        const element = createElement('prop-getter-accessKey-imperative', {
            is: AccessKeyMutations,
        });
        expect(element.accessKey).toBe('accessKey');
        expect(accessKeyGetterCounter).toBe(1);
    });

    it('should be reactive by default', () => {
        const element = createElement('prop-accessKey-reactive', { is: AccessKeyIsReactive });
        document.body.appendChild(element);

        element.accessKey = 'accessKey';
        return Promise.resolve().then(() => {
            expect(accessKeyIsReactiveRenderCount).toBe(2);
            expect(element.shadowRoot.querySelector('div').textContent).toBe('accessKey');
        });
    });

    it('should throw an error when setting default value in constructor', () => {
        expect(() => {
            createElement('x-foo', { is: AccesskeySetInConstructor });
        }).toThrowErrorDev(Error, /The result must not have attributes./);
    });
});
