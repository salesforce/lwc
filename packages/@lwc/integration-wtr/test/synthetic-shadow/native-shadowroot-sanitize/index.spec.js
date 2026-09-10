import { fn as mockFn } from '@vitest/spy';
import { getHooks, setHooks } from '../../../helpers/hooks.js';

// No native-sink patch exists in native mode — synthetic-shadow isn't loaded.
describe.skipIf(process.env.NATIVE_SHADOW)(
    'native ShadowRoot HTML sinks route through sanitizeHtmlContent',
    () => {
        // Sink routing is element-agnostic; inert <template> stands in for untrusted markup.
        const PAYLOAD =
            '<p>keep</p><a href="#">link</a><ul><li>x</li></ul><template>drop</template>';

        // Under synthetic shadow, attachShadow outside an LWC host returns a native root.
        function createNativeRoot() {
            return document.createElement('div').attachShadow({ mode: 'open' });
        }

        function sanitize(content) {
            return String(content).replace(/<template[\s\S]*?<\/template>/gi, '');
        }

        let original;
        beforeAll(() => {
            original = getHooks().sanitizeHtmlContent;
        });
        afterEach(() => setHooks({ sanitizeHtmlContent: original }));

        it('routes native innerHTML writes through the hook with the raw value', () => {
            const spy = mockFn((content) => sanitize(content));
            setHooks({ sanitizeHtmlContent: spy });

            const root = createNativeRoot();
            root.innerHTML = PAYLOAD;

            // Synthetic roots never call the hook; a call proves the native prototype was patched.
            expect(spy).toHaveBeenCalledWith(PAYLOAD);
        });

        it('strips untrusted markup written to a native root, keeping benign nodes', () => {
            setHooks({ sanitizeHtmlContent: sanitize });

            const root = createNativeRoot();
            root.innerHTML = PAYLOAD;

            expect(root.querySelector('template')).toBeNull();
            expect(root.querySelector('p')).not.toBeNull();
            expect(root.querySelector('a')).not.toBeNull();
            expect(root.querySelector('li').textContent).toBe('x');
        });

        it('passes benign markup through unchanged', () => {
            const spy = mockFn((content) => content);
            setHooks({ sanitizeHtmlContent: spy });

            const root = createNativeRoot();
            root.innerHTML = '<span>ok</span>';

            expect(spy).toHaveBeenCalledWith('<span>ok</span>');
            expect(root.querySelector('span')).not.toBeNull();
            expect(root.querySelector('span').textContent).toBe('ok');
        });

        it('writes the hook return value, not the raw input, to the native root', () => {
            setHooks({ sanitizeHtmlContent: () => '<b>safe</b>' });

            const root = createNativeRoot();
            root.innerHTML = PAYLOAD;

            expect(root.querySelector('b')).not.toBeNull();
            expect(root.querySelector('template')).toBeNull();
        });

        it('routes native setHTMLUnsafe through the hook when supported', function () {
            const root = createNativeRoot();
            if (typeof root.setHTMLUnsafe !== 'function') {
                this.skip();
                return;
            }

            const spy = mockFn((content) => sanitize(content));
            setHooks({ sanitizeHtmlContent: spy });

            root.setHTMLUnsafe(PAYLOAD);

            expect(spy).toHaveBeenCalledWith(PAYLOAD);
            expect(root.querySelector('template')).toBeNull();
            expect(root.querySelector('p')).not.toBeNull();
        });

        it('sanitizer bridge cannot be replaced by page code', () => {
            setHooks({ sanitizeHtmlContent: sanitize });

            // Frozen bridge: neither assignment nor redefine can swap in a passthrough.
            expect(() => {
                globalThis.$sanitizeHtmlContent$ = (value) => value;
            }).toThrow();
            expect(() =>
                Object.defineProperty(globalThis, '$sanitizeHtmlContent$', {
                    configurable: true,
                    value: (value) => value,
                })
            ).toThrow();

            const root = createNativeRoot();
            root.innerHTML = PAYLOAD;
            expect(root.querySelector('template')).toBeNull();
        });

        it('kill-switch bypasses the hook so native sinks are not sanitized', () => {
            const spy = mockFn((content) => sanitize(content));
            setHooks({ sanitizeHtmlContent: spy });
            lwcRuntimeFlags.DISABLE_NATIVE_SHADOWROOT_SINK_SANITIZATION = true;

            try {
                const root = createNativeRoot();
                root.innerHTML = '<span>ok</span>';

                expect(spy).not.toHaveBeenCalled();
                expect(root.querySelector('span')).not.toBeNull();
            } finally {
                lwcRuntimeFlags.DISABLE_NATIVE_SHADOWROOT_SINK_SANITIZATION = false;
            }
        });

        it('native innerHTML sink cannot be restored by page code', () => {
            setHooks({ sanitizeHtmlContent: sanitize });

            const root = createNativeRoot();
            // Non-configurable setter: page code can't restore the raw native sink.
            expect(() =>
                Object.defineProperty(Object.getPrototypeOf(root), 'innerHTML', {
                    configurable: true,
                    set() {},
                })
            ).toThrow();

            root.innerHTML = PAYLOAD;
            expect(root.querySelector('template')).toBeNull();
        });
    }
);
