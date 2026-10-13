import { createElement, setHooks } from 'lwc';
import StaticFragment from 'x/staticFragment';
import StaticSvgFragment from 'x/staticSvgFragment';
import { resetDOM, resetFragmentCache } from '../../../helpers/reset.js';
import { LOWERCASE_SCOPE_TOKENS } from '../../../helpers/constants.js';

afterEach(() => {
    resetFragmentCache();
    resetDOM();
});

// To guarantee that these tests are running in the correct state, they *must*
// live in a file where `setHooks` is never called.
describe.skipIf(process.env.DISABLE_STATIC_CONTENT_OPTIMIZATION)(
    'static content without a sanitize hook',
    () => {
        afterAll(() => {
            // Call the real `setHooks` (not the test util) twice to validate that it was not
            // previously set, as that would mean the test state is invalid
            const setHook = () => setHooks({ sanitizeHtmlContent() {} });
            expect(setHook).not.toThrow();
            expect(setHook).toThrow(
                'Hooks are already overridden, only one definition is allowed.'
            );
        });

        it('renders HTML content unchanged', () => {
            const elm = createElement('x-static-fragment', { is: StaticFragment });
            document.body.appendChild(elm);

            const span = elm.shadowRoot.querySelector('[data-id="region"] span');
            expect(span.hasAttribute('data-marker')).toBe(true);
            expect(span.hasAttribute('data-sanitized')).toBe(false);
        });

        it.runIf(LOWERCASE_SCOPE_TOKENS, 'renders SVG content unchanged', () => {
            const elm = createElement('x-static-svg-fragment', { is: StaticSvgFragment });
            document.body.appendChild(elm);

            const rect = elm.shadowRoot.querySelector('[data-id="region"] rect');
            expect(rect.hasAttribute('data-marker')).toBe(true);
            expect(rect.hasAttribute('data-sanitized')).toBe(false);
        });
    }
);
