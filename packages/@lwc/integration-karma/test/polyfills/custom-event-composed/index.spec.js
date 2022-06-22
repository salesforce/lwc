it('should set composed to false by default', () => {
    const evt = new CustomEvent('custom');
    expect(evt.composed).toBe(false);
});

it('should set composed to the value specified in the option', () => {
    const composedEvt = new CustomEvent('custom', { composed: true });
    expect(composedEvt.composed).toBe(true);

    const nonComposedEvt = new CustomEvent('custom', { composed: false });
    expect(nonComposedEvt.composed).toBe(false);
});
