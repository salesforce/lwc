// IE11 doesn't support FocusEvent constructor
// https://developer.mozilla.org/en-US/docs/Web/API/FocusEvent/FocusEvent#Browser_compatibility
function isFocusEventConstructorSupported() {
    try {
        new FocusEvent();
        return true;
    } catch (error) {
        return false;
    }
}

if (isFocusEventConstructorSupported()) {
    it('should set composed to false by default', () => {
        const focusEvent = new FocusEvent('focus');
        expect(focusEvent.composed).toBe(false);
    });

    fit('should set composed to the value specified in the option', () => {
        const composedEvt = new FocusEvent('focus', { composed: true });
        expect(composedEvt.composed).toBe(true);

        const nonComposedEvt = new FocusEvent('focus', { composed: false });
        expect(nonComposedEvt.composed).toBe(false);
    });
}

it('should make trusted FocusEvent composed', (done) => {
    const input = document.createElement('input');
    document.body.appendChild(input);

    // IE11 is the only browser dispatching the event asynchronously, so we need to make the assertion in the event
    // handler instead of after the input.focus() invocation.
    input.addEventListener('focus', event => {
        expect(event instanceof FocusEvent).toBe(true);
        expect(event.composed).toBe(true);

        done();
    });

    input.focus();
});


