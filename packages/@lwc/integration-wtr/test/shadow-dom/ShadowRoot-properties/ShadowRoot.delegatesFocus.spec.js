import { LightningElement } from 'lwc';
import { createElement } from 'lwc';

describe.skipIf(process.env.NATIVE_SHADOW)('ShadowRoot.delegatesFocus', () => {
    it('ShadowRoot.delegatesFocus should be false by default', () => {
        class NoDelegatesFocus extends LightningElement {}

        const elm = createElement('x-test', { is: NoDelegatesFocus });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.delegatesFocus).toBe(false);
    });
    it('ShadowRoot.delegatesFocus should be true if class has delegatesFocus static property set to true', () => {
        class DelegatesFocus extends LightningElement {
            static delegatesFocus = true;
        }

        const elm = createElement('x-test', { is: DelegatesFocus });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.delegatesFocus).toBe(true);
    });
});
