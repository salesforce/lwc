import { createElement, setFeatureFlagForTest, LightningElement } from 'lwc';

import Test from 'x/test';

describe('Basic Light DOM', () => {
    beforeEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
    });
    afterEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
    });
    it('should render properly', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.shadowRoot).toBeNull();
        expect(elm.firstChild.innerText).toEqual('Hello, Light DOM');
    });
    it('should render to Shadow DOM when feature is disabled', () => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
        expect(() => createElement('x-test', { is: Test })).toThrowError();
    });

    it('should return null for template', () => {
        const spy = spyOn(console, 'error');
        let template;
        class TemplateTest extends LightningElement {
            static shadow = false;
            connectedCallback() {
                template = this.template;
            }
        }

        const elm = createElement('x-test', { is: TemplateTest });
        document.body.appendChild(elm);
        expect(template).toBeNull();
        expect(spy.calls.mostRecent().args[0].message).toEqual(
            '[LWC error]: Template returns null in components with no shadow. Since there is no shadow, all the operations can be performed on `this` itself. e.g. instead of `this.template.querySelector`, use `this.querySelector`.'
        );
    });
});
