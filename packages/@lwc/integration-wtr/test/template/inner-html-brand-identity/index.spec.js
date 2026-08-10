import { createElement } from 'lwc';
import XInnerHtmlBrand from 'x/innerHtmlBrand';
import { getHooks, setHooks } from '../../../helpers/hooks.js';
import { resetDOM } from '../../../helpers/reset.js';

// W-23680734: the sanitized-HTML brand is now verified by object identity (a module-private
// WeakMap in engine-core `sanitized-html-content.ts`) instead of the structural
// `sanitizedHtmlContentSymbol in value` / `value[symbol]` operations, which depend on the
// value's own property semantics.
//
// The unit-level regression for the brand check itself lives in the engine-core test
// `framework/__tests__/sanitized-html-content.spec.ts`, exercised at the
// `safelySetProperty` / `unwrapIfNecessary` boundary (not reachable through the public
// `lwc:inner-html` flow, which always routes content through `shc()`). These real-browser tests
// instead guard that the identity brand does not regress the full render pipeline
// (create + update + clear), which the pure-function unit tests do not exercise.

let originalSanitizeHtmlContent;

beforeAll(() => {
    originalSanitizeHtmlContent = getHooks().sanitizeHtmlContent;
    // Identity passthrough sanitizer, matching the sibling directive-lwc-inner-html suite.
    setHooks({ sanitizeHtmlContent: (content) => content });
});

afterAll(() => {
    setHooks({ sanitizeHtmlContent: originalSanitizeHtmlContent });
});

afterEach(resetDOM);

it('renders legitimately-sanitized content as HTML (create)', () => {
    const elm = createElement('x-inner-html-brand', { is: XInnerHtmlBrand });
    elm.content = 'Hello <b>World</b>';
    document.body.appendChild(elm);

    const div = elm.shadowRoot.querySelector('div');
    expect(div.childNodes.length).toBe(2);
    expect(div.childNodes[0].textContent).toBe('Hello ');
    expect(div.childNodes[1].tagName).toBe('B');
    expect(div.childNodes[1].textContent).toBe('World');
});

it('re-renders legitimately-sanitized content on update', async () => {
    const elm = createElement('x-inner-html-brand', { is: XInnerHtmlBrand });
    elm.content = 'Hello <b>World</b>';
    document.body.appendChild(elm);
    expect(elm.shadowRoot.querySelector('b').textContent).toBe('World');

    elm.content = 'Hello <b>LWC</b>';
    await Promise.resolve();
    expect(elm.shadowRoot.querySelector('b').textContent).toBe('LWC');
});

it('clears content when set to an empty string', async () => {
    const elm = createElement('x-inner-html-brand', { is: XInnerHtmlBrand });
    elm.content = 'Hello <b>World</b>';
    document.body.appendChild(elm);
    expect(elm.shadowRoot.querySelector('b')).not.toBeNull();

    elm.content = '';
    await Promise.resolve();
    expect(elm.shadowRoot.querySelector('div').innerHTML).toBe('');
});
