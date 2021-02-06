if (process.env.COMPAT !== true) {
    describe('Event.composedPath() method', () => {
        describe('dispatched on shadow root', () => {
            it('{bubbles: true, composed: true}', (done) => {
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
                    done();
                });

                native.shadowRoot.dispatchEvent(
                    new CustomEvent('test', { bubbles: true, composed: true })
                );
            });
        });
        describe('dispatched on shadowed element', () => {
            it('{bubbles: true, composed: true}', (done) => {
                const native = document.createElement('x-native');
                const span = document.createElement('span');
                const sr = native.attachShadow({ mode: 'open' });
                sr.appendChild(span);
                document.body.appendChild(native);

                native.shadowRoot.addEventListener('test', (event) => {
                    expect(event.composedPath()).toEqual([
                        span,
                        native.shadowRoot,
                        native,
                        document.body,
                        document.documentElement,
                        document,
                        window,
                    ]);
                    done();
                });

                span.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
            });
        });
    });
}
