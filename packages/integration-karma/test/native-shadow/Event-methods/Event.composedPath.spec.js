if (process.env.COMPAT !== true) {
    describe('[W-9846457]', () => {
        let nativeParent;
        let nativeChild;
        const noop = () => {};

        beforeEach(() => {
            nativeParent = document.createElement('x-native-parent');
            nativeParent.attachShadow({ mode: 'open' });
            nativeChild = document.createElement('x-native-child');
            nativeChild.attachShadow({ mode: 'open' });

            nativeParent.shadowRoot.appendChild(nativeChild);
            document.body.appendChild(nativeParent);

            // Internally computes composed path and adds to cache
            document.addEventListener('test', noop, true);
        });

        afterEach(() => {
            nativeParent = null;
            nativeChild = null;
            document.removeEventListener('test', noop, true);
        });

        it('should handle composed bubbling events (nested child)', (done) => {
            nativeChild.addEventListener('test', (event) => {
                expect(event.composedPath()).toEqual([
                    nativeChild.shadowRoot,
                    nativeChild,
                    nativeParent.shadowRoot,
                    nativeParent,
                    document.body,
                    document.documentElement,
                    document,
                    window,
                ]);
                done();
            });

            nativeChild.shadowRoot.dispatchEvent(
                new CustomEvent('test', { composed: true, bubbles: true })
            );
        });

        it('should handle composed bubbling events (root parent)', (done) => {
            nativeParent.addEventListener('test', (event) => {
                expect(event.composedPath()).toEqual([
                    nativeChild.shadowRoot,
                    nativeChild,
                    nativeParent.shadowRoot,
                    nativeParent,
                    document.body,
                    document.documentElement,
                    document,
                    window,
                ]);
                done();
            });

            nativeChild.shadowRoot.dispatchEvent(
                new CustomEvent('test', { composed: true, bubbles: true })
            );
        });
    });

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
