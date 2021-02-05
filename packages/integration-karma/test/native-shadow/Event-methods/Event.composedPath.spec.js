if (process.env.COMPAT !== true) {
    describe('Event.composedPath() method', () => {
        it('should return expected value', () => {
            const native = document.createElement('x-native');
            native.attachShadow({ mode: 'open' });
            document.body.appendChild(native);

            native.shadowRoot.addEventListener('test', (event) => {
                expect(event.composedPath()).toEqual([
                    native.shadowRoot,
                    native,
                    document.body,
                    document.documentElement,
                    document,
                    window,
                ]);
            });

            native.shadowRoot.dispatchEvent(
                new CustomEvent('test', { bubbles: true, composed: true })
            );
        });
    });
}
