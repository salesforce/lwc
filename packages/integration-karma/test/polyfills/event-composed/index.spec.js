it('should not set composed to true if the event is not trusted', () => {
    const clickEvent = new Event('click');
    expect(clickEvent.composed).toBe(false);
});

it('should respect when the event composed flag is set during construction', () => {
    const composedClickEvent = new Event('click', { composed: true });
    expect(composedClickEvent.composed).toBe(true);

    const notComposedClickEvent = new Event('click', { composed: false });
    expect(notComposedClickEvent.composed).toBe(false);
});
