import { LightningElement } from 'lwc';
import { createElement } from 'lwc';

describe('ShadowRoot.mode', () => {
    function testShadowRootMode(mode, expectMode) {
        it(`should return ${expectMode} when creating element with mode=${mode}`, () => {
            let shadowRoot;

            class Test extends LightningElement {
                connectedCallback() {
                    shadowRoot = this.template;
                }
            }

            const elm = createElement('x-test', { is: Test, mode });
            document.body.appendChild(elm);

            expect(shadowRoot.mode).toBe(expectMode);
        });
    }

    testShadowRootMode(undefined, 'open');
    testShadowRootMode('open', 'open');
    testShadowRootMode('closed', 'closed');
});
