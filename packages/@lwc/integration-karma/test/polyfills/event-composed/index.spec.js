it('should not set composed to true if the event is not set during construction', () => {
    const clickEvent = new Event('click');
    expect(clickEvent.composed).toBe(false);
});

it('should respect when the event composed flag is set during construction', () => {
    const composedClickEvent = new Event('click', { composed: true });
    expect(composedClickEvent.composed).toBe(true);

    const notComposedClickEvent = new Event('click', { composed: false });
    expect(notComposedClickEvent.composed).toBe(false);
});

it('should set composed to true for click events dispatched by the user agent', async () => {
    const elm = document.createElement('div');
    document.body.appendChild(elm);

    const composed = await new Promise((resolve) => {
        elm.addEventListener('click', (evt) => {
            resolve(evt.composed);
        });
        elm.click();
    });

    expect(composed).toBe(true);
});
