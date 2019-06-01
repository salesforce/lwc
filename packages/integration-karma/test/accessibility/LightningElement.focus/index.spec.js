import { createElement } from 'lwc';

import DelegatesFocusTrue from 'x/delegatesFocusTrue';
import DelegatesFocusFalse from 'x/delegatesFocusFalse';
import Container from 'x/container';

beforeEach(() => {
    document.body.focus();
});

// TODO: #1327 - enable after patching focus method
xit('should focus the first internally focusable element (delegatesFocus=true)', () => {
    const elm = createElement('x-focus', { is: DelegatesFocusTrue });
    document.body.appendChild(elm);

    elm.focus();
    const input = elm.shadowRoot.querySelector('.delegates-focus-true-first');
    expect(elm.shadowRoot.activeElement).toBe(input);
});

it('should not focus the first internally focusable element (delegatesFocus=false)', () => {
    const elm = createElement('x-focus', { is: DelegatesFocusFalse });
    document.body.appendChild(elm);

    elm.focus();
    expect(elm.shadowRoot.activeElement).toBeNull();
});

// TODO: #1329 - enable after fixing bug where the custom element does not gain focus
xit('should focus the host element (delegatesFocus=false, tabIndex=-1)', () => {
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

    it(`should not move focus if an internal element is already focused ${category}`, () => {
        const elm = createElement('x-focus', { is: Ctor });
        document.body.appendChild(elm);

        const input = elm.shadowRoot.querySelector('.second');
        input.focus();
        elm.focus();
        expect(elm.shadowRoot.activeElement).toBe(input);
    });
}

runFocusTests({ delegatesFocus: true });
runFocusTests({ delegatesFocus: false });
