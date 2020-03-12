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

    it('should set composed to the value specified in the option', () => {
        const composedEvt = new FocusEvent('focus', { composed: true });
        expect(composedEvt.composed).toBe(true);

        const nonComposedEvt = new FocusEvent('focus', { composed: false });
        expect(nonComposedEvt.composed).toBe(false);
    });
}
