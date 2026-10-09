import { createElement } from 'lwc';
import StaticFragment from 'x/staticFragment';
import StaticSvgFragment from 'x/staticSvgFragment';
import { fn as mockFn } from '@vitest/spy';
import { getHooks, setHooks } from '../../../helpers/hooks.js';
import { resetDOM, resetFragmentCache } from '../../../helpers/reset.js';
import { LOWERCASE_SCOPE_TOKENS } from '../../../helpers/constants.js';

const MARKER_BEFORE = 'data-marker';
const MARKER_AFTER = 'data-sanitized';

let originalSanitizeHtmlContent;
const mockSanitize = mockFn((content) => {
    return String(content).replaceAll(MARKER_BEFORE, MARKER_AFTER);
});

beforeAll(() => {
    originalSanitizeHtmlContent = getHooks().sanitizeHtmlContent;
    setHooks({ sanitizeHtmlContent: mockSanitize });
});

beforeEach(() => {
    mockSanitize.mockReset();
});

afterEach(() => {
    setHooks({ sanitizeHtmlContent: originalSanitizeHtmlContent });
    // Static fragments are cached by the (module-level) template literal, so a fragment parsed
    // under one flag state would otherwise leak into the next test.
    resetFragmentCache();
    resetDOM();
});

describe.skipIf(process.env.DISABLE_STATIC_CONTENT_OPTIMIZATION)(
    'static content sanitization (W-23814957)',
    () => {
        it('works on HTML content', () => {
            const elm = createElement('x-static-fragment', { is: StaticFragment });
            document.body.appendChild(elm);
            const span = elm.shadowRoot.querySelector('[data-id="region"] span');

            // The hook saw the assembled static-fragment markup before it became DOM...
            expect(mockSanitize).toHaveBeenCalledWith(expect.stringContaining(MARKER_BEFORE));
            // ...and its sanitized result is what reached the live DOM: the marker is gone.
            expect(span.hasAttribute(MARKER_BEFORE)).toBe(false);
            expect(span.hasAttribute(MARKER_AFTER)).toBe(true);
        });

        // SVGs are excluded from static content optimization prior to API version 59
        it.runIf(LOWERCASE_SCOPE_TOKENS, 'works on SVG content', () => {
            const elm = createElement('x-static-svg-fragment', { is: StaticSvgFragment });
            document.body.appendChild(elm);
            const rect = elm.shadowRoot.querySelector('[data-id="region"] rect');

            expect(mockSanitize).toHaveBeenCalledOnceWith(MARKER_BEFORE);
            // ...and the sanitized result is what reached the live DOM.
            expect(rect.hasAttribute(MARKER_BEFORE)).toBe(false);
            expect(rect.hasAttribute(MARKER_AFTER)).toBe(true);
        });

        it.skip('renders unmodified if no sanitize hook is set', () => {
            // TO DO
        });
    }
);
