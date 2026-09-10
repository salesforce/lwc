import { createElement, setFeatureFlagForTest } from 'lwc';
import StaticFragment from 'x/staticFragment';
import StaticSvgFragment from 'x/staticSvgFragment';
import UnsafeFragment from 'x/unsafeFragment';
import { getHooks, setHooks } from '../../../helpers/hooks.js';
import { resetDOM, resetFragmentCache } from '../../../helpers/reset.js';
import { LOWERCASE_SCOPE_TOKENS } from '../../../helpers/constants.js';

// W-23814957: the static-content optimization builds its fragment by assigning the
// component-authored markup to a `<template>.innerHTML` (see `createFragment` in @lwc/engine-dom).
// The `lwc:inner-html` directive routes its markup through the `sanitizeHtmlContent` hook before it
// becomes DOM; the static-content path does not. The opt-in `ENABLE_PARSE_FRAGMENT_SANITIZATION`
// flag routes the assembled markup through that same hook so both paths are consistent.
//
// This real-browser test exercises the actual `innerHTML` path (which the node/server unit test in
// engine-server cannot) and asserts the flag toggles whether the hook is consulted for
// static-content markup.

const FLAG = 'ENABLE_PARSE_FRAGMENT_SANITIZATION';
const MARKER = 'data-marker';

// The hook only runs when the component actually compiles to a `parseFragment` / `parseSVGFragment`
// call. That optimization is off when `DISABLE_STATIC_CONTENT_OPTIMIZATION=1` (both fragment
// variants fall back to the vdom path), and SVG specifically is excluded from the optimization
// before API version 59 (see `isStaticNode` in @lwc/template-compiler). In those configs there is
// no static fragment for the hook to process, so the "flag enabled" assertions do not apply.
const STATIC_CONTENT_OPTIMIZATION_ENABLED = !process.env.DISABLE_STATIC_CONTENT_OPTIMIZATION;
const SVG_STATIC_CONTENT_OPTIMIZATION_ENABLED =
    STATIC_CONTENT_OPTIMIZATION_ENABLED && LOWERCASE_SCOPE_TOKENS;

let originalSanitizeHtmlContent;

beforeAll(() => {
    originalSanitizeHtmlContent = getHooks().sanitizeHtmlContent;
});

afterEach(() => {
    setHooks({ sanitizeHtmlContent: originalSanitizeHtmlContent });
    setFeatureFlagForTest(FLAG, false);
    // Static fragments are cached by the (module-level) template literal, so a fragment parsed
    // under one flag state would otherwise leak into the next test.
    resetFragmentCache();
    resetDOM();
});

function render() {
    const elm = createElement('x-static-fragment', { is: StaticFragment });
    document.body.appendChild(elm);
    return elm;
}

function renderSvg() {
    const elm = createElement('x-static-svg-fragment', { is: StaticSvgFragment });
    document.body.appendChild(elm);
    return elm;
}

function renderUnsafe() {
    const elm = createElement('x-unsafe-fragment', { is: UnsafeFragment });
    document.body.appendChild(elm);
    return elm;
}

// A DOMPurify-style hook that removes `javascript:` URL schemes — the single transformation that
// matters for the security contract below. It leaves all other markup untouched, so it cannot pass
// merely by mangling something incidental.
function installSchemeStrippingHook() {
    const seen = [];
    setHooks({
        sanitizeHtmlContent: (content) => {
            const markup = String(content);
            seen.push(markup);
            return markup.replace(/javascript:/gi, '');
        },
    });
    return seen;
}

it('does not route static-content markup through the hook when the flag is unset (default)', () => {
    // A hook that renames the marker — it must never be consulted for static content by default,
    // and its rename must therefore have no effect.
    let called = false;
    setHooks({
        sanitizeHtmlContent: (content) => {
            called = true;
            return String(content).replaceAll(MARKER, 'data-sanitized');
        },
    });

    const elm = render();
    const span = elm.shadowRoot.querySelector('[data-id="region"] span');

    expect(called).toBe(false);
    // The authored marker reaches the live DOM unchanged.
    expect(span.hasAttribute(MARKER)).toBe(true);
});

it.skipIf(!STATIC_CONTENT_OPTIMIZATION_ENABLED)(
    'routes static-content markup through the hook when the flag is enabled',
    () => {
        setFeatureFlagForTest(FLAG, true);
        // A hook that renames the marker attribute on whatever markup it is handed.
        let seenMarkup;
        setHooks({
            sanitizeHtmlContent: (content) => {
                seenMarkup = String(content);
                return seenMarkup.replaceAll(MARKER, 'data-sanitized');
            },
        });

        const elm = render();
        const span = elm.shadowRoot.querySelector('[data-id="region"] span');

        // The hook saw the assembled static-fragment markup before it became DOM...
        expect(seenMarkup).toContain(MARKER);
        // ...and its sanitized result is what reached the live DOM: the marker is gone.
        expect(span.hasAttribute(MARKER)).toBe(false);
        expect(span.hasAttribute('data-sanitized')).toBe(true);
    }
);

it.skipIf(!SVG_STATIC_CONTENT_OPTIMIZATION_ENABLED)(
    'sanitizes the SVG-variant markup with its <svg> wrapper in place when the flag is enabled',
    () => {
        setFeatureFlagForTest(FLAG, true);
        // Same hook, but record every markup string the hook is handed so we can assert the SVG
        // variant is processed in the same parsing context (namespace) `createFragment` will use.
        const seen = [];
        setHooks({
            sanitizeHtmlContent: (content) => {
                const markup = String(content);
                seen.push(markup);
                return markup.replaceAll(MARKER, 'data-sanitized');
            },
        });

        const elm = renderSvg();
        const rect = elm.shadowRoot.querySelector('[data-id="region"] rect');

        // The SVG child's markup was handed to the hook already wrapped in <svg>...</svg> — i.e. in
        // the namespace `createFragment` will parse it in, not the raw pre-wrap markup.
        const svgMarkup = seen.find((m) => m.includes(MARKER));
        expect(svgMarkup).toBeDefined();
        expect(svgMarkup).toContain('<svg>');
        // ...and the sanitized result is what reached the live DOM.
        expect(rect.hasAttribute(MARKER)).toBe(false);
        expect(rect.hasAttribute('data-sanitized')).toBe(true);
    }
);

// W-23814957, security contract. The static-content path assigns author markup to a host-realm
// `<template>.innerHTML` with no compile-time sanitization, so a value the compiler bakes in
// verbatim — here a `javascript:` URL — reaches the DOM exactly as authored. These two tests pin the
// before/after of the fix: with the flag OFF the consumer's `sanitizeHtmlContent` hook is bypassed
// on this path (the pre-fix gap), and with it ON the same hook gets to neutralize the value (the
// fix). The `href` is inert (`javascript:0`) and is never navigated — the point is only that the
// sanitizer is, or is not, given the chance to strip it.
const UNSAFE_HREF = 'javascript:0';

it('bypasses the sanitizer for static-content markup when the flag is unset (pre-fix gap)', () => {
    // A scheme-stripping hook is installed, but by default the static-content path never consults it.
    const seen = installSchemeStrippingHook();

    const elm = renderUnsafe();
    const link = elm.shadowRoot.querySelector('[data-id="link"]');

    // The hook was not consulted, so the `javascript:` URL the compiler baked in reaches the DOM
    // verbatim — the exact exposure the flag exists to close.
    expect(seen).toHaveLength(0);
    expect(link.getAttribute('href')).toBe(UNSAFE_HREF);
});

it.skipIf(!STATIC_CONTENT_OPTIMIZATION_ENABLED)(
    'lets the sanitizer neutralize dangerous static-content markup when the flag is enabled (fix)',
    () => {
        setFeatureFlagForTest(FLAG, true);
        const seen = installSchemeStrippingHook();

        const elm = renderUnsafe();
        const link = elm.shadowRoot.querySelector('[data-id="link"]');

        // The hook saw the assembled markup with the dangerous scheme still present...
        const markup = seen.find((m) => m.includes(UNSAFE_HREF));
        expect(markup).toBeDefined();
        // ...and its sanitized result is what reached the live DOM: the `javascript:` scheme is gone.
        expect(link.getAttribute('href')).toBe('0');
        expect(link.getAttribute('href')).not.toContain('javascript:');
    }
);
