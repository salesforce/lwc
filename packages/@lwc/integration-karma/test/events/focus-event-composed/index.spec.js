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
