import { fn as mockFn } from '@vitest/spy';
import { getHooks, setHooks } from '../../../helpers/hooks.js';

// In native mode synthetic-shadow isn't loaded, so there's no wrapper to exercise.
describe.skipIf(process.env.NATIVE_SHADOW)(
    'native ShadowRoot HTML sinks route through sanitizeHtmlContent',
    () => {
        // Routing is element-agnostic; an inert <template> stands in for the markup the hook drops.
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

            // Synthetic roots never call the hook; a call proves the native prototype was wrapped.
            expect(spy).toHaveBeenCalledWith(PAYLOAD);
        });

        it('removes the markup the hook drops from a native root, keeping the rest', () => {
            setHooks({ sanitizeHtmlContent: sanitize });

            const root = createNativeRoot();
            root.innerHTML = PAYLOAD;

            expect(root.querySelector('template')).toBeNull();
            expect(root.querySelector('p')).not.toBeNull();
            expect(root.querySelector('a')).not.toBeNull();
            expect(root.querySelector('li').textContent).toBe('x');
        });

        it('passes markup through unchanged when the hook is a passthrough', () => {
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

        it('global hook bridge is non-writable and non-configurable', () => {
            setHooks({ sanitizeHtmlContent: sanitize });

            // Neither assignment nor redefine succeeds against the frozen bridge.
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

        it('kill-switch flag makes native sink writes bypass the hook', () => {
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

        it('wrapped native innerHTML accessor is non-configurable', () => {
            setHooks({ sanitizeHtmlContent: sanitize });

            const root = createNativeRoot();
            // Non-configurable accessor: redefining it throws.
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
