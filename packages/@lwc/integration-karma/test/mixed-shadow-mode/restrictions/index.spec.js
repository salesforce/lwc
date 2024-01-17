import { createElement } from 'lwc';
import Component from 'x/component';

describe('restrictions', () => {
    let elm;
    beforeEach(() => {
        elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);
    });

    describe('ShadowRoot', () => {
        it('innerHTML', () => {
            expect(() => {
                elm.setInnerHtmlOnShadowRoot();
            }).toLogErrorDev(/Invalid attempt to set innerHTML on ShadowRoot./);
        });
        it('textContent', () => {
            expect(() => {
                elm.setTextContentOnShadowRoot();
            }).toLogErrorDev(/Invalid attempt to set textContent on ShadowRoot./);
        });
    });

    describe('custom element', () => {
        it('innerHTML', () => {
            expect(() => {
                elm.innerHTML = '<div></div>';
            }).toLogErrorDev(/Invalid attempt to set innerHTML on HTMLElement./);
        });
        it('outerHTML', () => {
            expect(() => {
                elm.outerHTML = '<div></div>';
            }).toLogErrorDev(/Invalid attempt to set outerHTML on HTMLElement./);
        });
        it('textContent', () => {
            expect(() => {
                elm.textContent = '<div></div>';
            }).toLogErrorDev(/Invalid attempt to set textContent on HTMLElement./);
        });
        it('addEventListener', () => {
            expect(() => {
                elm.addEventListener('click', () => {}, { once: true });
            }).toLogErrorDev(
                'Error: [LWC error]: The `addEventListener` method in `LightningElement` does not support any options.\n'
            );
        });
    });

    describe('LightningElement', () => {
        it('get className', () => {
            expect(() => {
                elm.getClassName();
            }).not.toLogErrorDev();
        });

        it('set accessKeyLabel', () => {
            expect(() => {
                elm.setAccessKeyLabel('foo');
            }).not.toLogErrorDev();
        });
    });

    describe('Element', () => {
        function throwsWhenSettingOuterHtmlOnChildOfNativeShadowRoot() {
            // As of this writing (late 2022), Firefox does not throw here, but Chrome and Safari do.
            // https://bugs.chromium.org/p/chromium/issues/detail?id=1403060
            // https://bugs.webkit.org/show_bug.cgi?id=249737
            try {
                const container = document.createElement('div');
                container.attachShadow({ mode: 'open' }).innerHTML = '<div></div>';
                container.shadowRoot.querySelector('div').outerHTML = '';
                return false;
            } catch (e) {
                return true;
            }
        }

        it('should throw on setting outerHTML', () => {
            // Using two expect()s because one looks for errors, the other looks for logs
            expect(() => {
                // eslint-disable-next-line jest/valid-expect
                let expected = expect(() => {
                    elm.shadowRoot.querySelector('div').outerHTML = '';
                });

                if (
                    !(
                        process.env.NATIVE_SHADOW &&
                        throwsWhenSettingOuterHtmlOnChildOfNativeShadowRoot()
                    )
                ) {
                    // Expect this to throw in native shadow when the browser throws an error for this case
                    expected = expected.not;
                }

                expected.toThrowError(
                    /Invalid attempt to set outerHTML on Element|This element's parent is of type '#document-fragment', which is not an element node|Cannot set outerHTML on element because its parent is not an Element/
                );
            }).toLogErrorDev(/Invalid attempt to set outerHTML on Element/);
        });
    });
});
