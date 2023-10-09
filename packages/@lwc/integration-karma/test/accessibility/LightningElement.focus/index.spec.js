import { createElement } from 'lwc';

import DelegatesFocusTrue from 'x/delegatesFocusTrue';
import DelegatesFocusFalse from 'x/delegatesFocusFalse';
import Container from 'x/container';

describe('LightningElement.focus', () => {
    beforeEach(() => {
        document.body.focus();
    });

    describe('host.focus() when { delegatesFocus: true }', () => {
        it('should focus the host element', () => {
            const elm = createElement('x-focus', { is: DelegatesFocusTrue });
            document.body.appendChild(elm);
            elm.focus();

            expect(document.activeElement).toEqual(elm);
        });

        it('should focus the first internally focusable element', () => {
            const elm = createElement('x-focus', { is: DelegatesFocusTrue });
            document.body.appendChild(elm);
            elm.focus();

            const input = elm.shadowRoot.querySelector('.first');
            expect(elm.shadowRoot.activeElement).toEqual(input);
        });
    });

    it('should not focus the first internally focusable element (delegatesFocus=false)', () => {
        const elm = createElement('x-focus', { is: DelegatesFocusFalse });
        document.body.appendChild(elm);

        elm.focus();
        expect(elm.shadowRoot.activeElement).toBeNull();
    });

    it('should focus the host element (delegatesFocus=false, tabIndex=-1)', () => {
        const container = createElement('x-container', { is: Container });
        document.body.appendChild(container);

        const elm = container.shadowRoot.querySelector('x-delegates-focus-false[tabindex="-1"]');
        elm.focus();
        expect(container.shadowRoot.activeElement).toBe(elm);
        expect(elm.shadowRoot.activeElement).toBeNull();
    });

    it('should focus the host element (delegatesFocus=false, tabIndex=0)', () => {
        const container = createElement('x-container', { is: Container });
        document.body.appendChild(container);

        const elm = container.shadowRoot.querySelector('x-delegates-focus-false[tabindex="0"]');
        elm.focus();
        expect(container.shadowRoot.activeElement).toBe(elm);
        expect(elm.shadowRoot.activeElement).toBeNull();
    });

    // Tests that apply regardless of whether focus is being delegated
    function runFocusTests({ delegatesFocus }) {
        const category = `(delegatesFocus=${delegatesFocus})`;
        const Ctor = delegatesFocus ? DelegatesFocusTrue : DelegatesFocusFalse;

        it(`should focus the internal element when invoking the focus method directly on the internal element ${category}`, () => {
            const elm = createElement('x-focus', { is: Ctor });
            document.body.appendChild(elm);

            const input = elm.shadowRoot.querySelector('.second');
            input.focus();
            expect(elm.shadowRoot.activeElement).toBe(input);
        });

        it(`should blur the internal element when invoking the blur method directly on the internal element ${category}`, () => {
            const elm = createElement('x-focus', { is: Ctor });
            document.body.appendChild(elm);

            const input = elm.shadowRoot.querySelector('.second');
            input.focus();
            input.blur();
            expect(elm.shadowRoot.activeElement).toBeNull();
        });

        // TODO [#3724]: There's a bug in Safari that causes non-focusable custom elements
        // to be focusable when formAssociated=true.
        // Note in Chrome and Firefox the behavior is the same, document.activeElement does not point to the
        // custom element but to the <body>
        const customElementFocusableWhenFormAssociated = () => {
            if (!customElements.get('safari-focus-bug')) {
                customElements.define(
                    'safari-focus-bug',
                    class SafariFocusBug extends HTMLElement {
                        static formAssociated = true;
                    }
                );
            }
            // Reset focus
            document.body.focus();
            // Create CE and focus it
            const elm = document.createElement('safari-focus-bug');
            document.body.appendChild(elm);
            elm.focus();
            // Verify if bug exists
            const isCEFocused = document.activeElement === elm;
            document.body.removeChild(elm);
            return isCEFocused;
        };

        if (
            !(process.env.NATIVE_SHADOW && delegatesFocus) &&
            !customElementFocusableWhenFormAssociated()
        ) {
            it(`should not move focus if an internal element is already focused ${category}`, () => {
                const elm = createElement('x-focus', { is: Ctor });
                document.body.appendChild(elm);

                const input = elm.shadowRoot.querySelector('.second');
                input.focus();
                elm.focus();
                expect(elm.shadowRoot.activeElement).toBe(input);
            });
        }
    }

    runFocusTests({ delegatesFocus: true });
    runFocusTests({ delegatesFocus: false });
});
