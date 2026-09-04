import { fn as mockFn } from '@vitest/spy';
import { getHooks, setHooks } from '../../../helpers/hooks.js';

// Skipped in native mode: synthetic-shadow isn't loaded there, so there is no native-sink patch to test.
describe.skipIf(process.env.NATIVE_SHADOW)(
    'native ShadowRoot HTML sinks route through sanitizeHtmlContent',
    () => {
        const PAYLOAD = '<iframe srcdoc="<script>window.__pwned = true</script>"></iframe>';

        // Outside an LWC host, attachShadow yields a native root under synthetic shadow.
        function createNativeRoot() {
            return document.createElement('div').attachShadow({ mode: 'open' });
        }

        function stripDangerous(content) {
            return String(content)
                .replace(/<script[\s\S]*?<\/script>/gi, '')
                .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
                .replace(/<iframe\b[^>]*>/gi, '');
        }

        let original;
        beforeAll(() => {
            original = getHooks().sanitizeHtmlContent;
        });
        afterEach(() => setHooks({ sanitizeHtmlContent: original }));

        it('routes native innerHTML writes through the hook with the raw value', () => {
            const spy = mockFn((content) => stripDangerous(content));
            setHooks({ sanitizeHtmlContent: spy });

            const root = createNativeRoot();
            root.innerHTML = PAYLOAD;

            // A synthetic root's innerHTML setter never calls the hook, so being called at all proves
            // the write went through the patched *native* prototype.
            expect(spy).toHaveBeenCalledWith(PAYLOAD);
        });

        it('neutralizes the srcdoc PoC written to a native root innerHTML', () => {
            setHooks({ sanitizeHtmlContent: stripDangerous });

            const root = createNativeRoot();
            root.innerHTML = PAYLOAD;

            expect(root.querySelector('iframe')).toBeNull();
            expect(root.querySelector('script')).toBeNull();
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
            expect(root.querySelector('iframe')).toBeNull();
        });

        it('routes native setHTMLUnsafe through the hook when supported', function () {
            const root = createNativeRoot();
            if (typeof root.setHTMLUnsafe !== 'function') {
                this.skip();
                return;
            }

            const spy = mockFn((content) => stripDangerous(content));
            setHooks({ sanitizeHtmlContent: spy });

            root.setHTMLUnsafe(PAYLOAD);

            expect(spy).toHaveBeenCalledWith(PAYLOAD);
            expect(root.querySelector('iframe')).toBeNull();
            expect(root.querySelector('script')).toBeNull();
        });
    }
);
