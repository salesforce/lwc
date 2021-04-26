import { createElement, setFeatureFlagForTest, LightningElement } from 'lwc';

import Test from 'x/test';
import FalsyShadow from 'x/falsy-shadow';

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
    it('should throw error when feature is disabled', () => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
        expect(() => createElement('x-test', { is: Test })).toThrowErrorDev(
            Error,
            'Invariant Violation: Test is an invalid LWC component. Light DOM components are not available in this environment.'
        );
    });

    it('should return null for template', () => {
        let template;
        class TemplateTest extends LightningElement {
            static shadow = false;
            connectedCallback() {
                template = this.template;
            }
        }

        expect(() => {
            const elm = createElement('x-test', { is: TemplateTest });
            document.body.appendChild(elm);
        }).toLogErrorDev(
            'Error: [LWC error]: `this.template` returns null for light DOM components. Since there is no shadow, the rendered content can be accessed via `this` itself. e.g. instead of `this.template.querySelector`, use `this.querySelector`.'
        );

        expect(template).toBeNull();
    });

    it('should render to Shadow DOM when shadow is falsy non-boolean', () => {
        const elm = createElement('x-falsy-shadow', { is: FalsyShadow });
        expect(elm.shadowRoot).not.toBeNull();
    });
});
