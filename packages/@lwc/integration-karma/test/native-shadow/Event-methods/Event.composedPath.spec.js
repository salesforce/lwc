import { createElement } from 'lwc';
import { nativeCustomElementLifecycleEnabled } from 'test-utils';
import Synthetic from 'x/synthetic';

describe('[W-9846457] event access when using native shadow dom', () => {
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

    it('should handle composed bubbling events (native element)', (done) => {
        const div = document.createElement('div');
        const span = document.createElement('span');

        const shadowRoot = div.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(span);
        document.body.appendChild(div);

        div.addEventListener('test', (event) => {
            expect(event.composedPath()).toEqual([
                span,
                div.shadowRoot,
                div,
                document.body,
                document.documentElement,
                document,
                window,
            ]);
            done();
        });

        span.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
    });

    it('should handle composed bubbling events (synthetic above native)', (done) => {
        const synthetic = createElement('x-synthetic', { is: Synthetic });
        const div = document.createElement('div');

        div.attachShadow({ mode: 'open' });
        synthetic.shadowRoot.appendChild(div);
        document.body.appendChild(synthetic);

        let expected;
        if (process.env.NATIVE_SHADOW) {
            expected = [
                div.shadowRoot,
                div,
                synthetic.shadowRoot,
                synthetic,
                document.body,
                document.documentElement,
                document,
                window,
            ];
        } else {
            // The synthetic shadow root is transparent to the native composedPath() because
            // it's not actually rendered in the DOM. This is not an issue because LWC doesn't
            // yet support native web components.
            expected = [
                div.shadowRoot,
                div,
                /* synthetic.shadowRoot, */
                synthetic,
                document.body,
                document.documentElement,
                document,
                window,
            ];
        }

        synthetic.addEventListener('test', (event) => {
            expect(event.composedPath()).toEqual(expected);
            done();
        });

        div.shadowRoot.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
    });

    it('should handle composed bubbling events (native above synthetic)', (done) => {
        const synthetic = createElement('x-synthetic', { is: Synthetic });
        const native = document.createElement('div');

        native.attachShadow({ mode: 'open' });

        const doAppend = () => native.shadowRoot.appendChild(synthetic);
        if (nativeCustomElementLifecycleEnabled) {
            doAppend();
        } else {
            // Expected warning, since we are working with disconnected nodes
            expect(doAppend).toLogWarningDev(
                /fired a `connectedCallback` and rendered, but was not connected to the DOM/
            );
        }

        document.body.appendChild(native);

        synthetic.addEventListener('test', (event) => {
            expect(event.composedPath()).toEqual([
                synthetic.shadowRoot,
                synthetic,
                native.shadowRoot,
                native,
                document.body,
                document.documentElement,
                document,
                window,
            ]);
            done();
        });

        synthetic.shadowRoot.dispatchEvent(
            new CustomEvent('test', { bubbles: true, composed: true })
        );
    });
});

describe('Event.composedPath() method', () => {
    describe('dispatched on shadow root', () => {
        it('{bubbles: true, composed: true}', (done) => {
            const native = document.createElement('x-native-name-unique-to-this-test-1');
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
            const native = document.createElement('x-native-name-unique-to-this-test-2');
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
