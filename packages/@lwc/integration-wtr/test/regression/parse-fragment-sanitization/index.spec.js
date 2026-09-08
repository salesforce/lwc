import { createElement, setFeatureFlagForTest } from 'lwc';
import StaticFragment from 'x/staticFragment';
import StaticSvgFragment from 'x/staticSvgFragment';
import ScopedFragment from 'x/scopedFragment';
import ScopedSvgFragment from 'x/scopedSvgFragment';
import { getHooks, setHooks } from '../../../helpers/hooks.js';
import { resetDOM, resetFragmentCache } from '../../../helpers/reset.js';
import { IS_SYNTHETIC_SHADOW_LOADED, LOWERCASE_SCOPE_TOKENS } from '../../../helpers/constants.js';

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

// The engine emits a bare `lwc-<hash>` attribute (synthetic-shadow style scoping) only in synthetic
// shadow. In native shadow only the scope *class* is emitted (for `*.scoped.css`).
const EXPECT_BARE_SCOPE_ATTR = IS_SYNTHETIC_SHADOW_LOADED && !process.env.NATIVE_SHADOW;

// The lowercase-hash scope token format (e.g. `lwc-2it5vhebv0i`). Only valid to assert against when
// LOWERCASE_SCOPE_TOKENS is on; below API v59 the token is the legacy `x-name_name` format.
const SCOPE_TOKEN_RE = /lwc-[a-z0-9]+/;

// A DOMPurify-style lossy hook: it strips *valueless* `lwc-<hash>` attributes (exactly what broke
// scoped styles on HEAD when the flag was enabled) and records every markup string it is handed.
// If the engine did NOT withhold the scope token, this hook would strip it and scoping would break.
function installLossyHook() {
    const seen = [];
    setHooks({
        sanitizeHtmlContent: (content) => {
            const markup = String(content);
            seen.push(markup);
            // Remove bare (valueless) lwc-<hash> attributes, i.e. `<span ... lwc-abc123>` — but not
            // the class value `class="lwc-abc123"` (that has an `=`).
            return markup.replace(/\s+lwc-[a-z0-9]+(?=[\s/>])/g, '');
        },
    });
    return seen;
}

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

function renderScoped() {
    const elm = createElement('x-scoped-fragment', { is: ScopedFragment });
    document.body.appendChild(elm);
    return elm;
}

function renderScopedSvg() {
    const elm = createElement('x-scoped-svg-fragment', { is: ScopedSvgFragment });
    document.body.appendChild(elm);
    return elm;
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

// W-23814957 regression: enabling the flag must NOT break scoped styles. The engine withholds the
// scope token from the string handed to the hook and re-stamps it onto the parsed DOM, so a lossy
// (token-stripping) hook can no longer unscope the component. Without the engine-side fix, the hook
// below strips the bare `lwc-<hash>` attribute and the scoped rule stops matching — these fail.
it.skipIf(!STATIC_CONTENT_OPTIMIZATION_ENABLED || !LOWERCASE_SCOPE_TOKENS)(
    'preserves the engine scope token (class + bare attr) through a lossy hook, keeping scoped styles applied',
    () => {
        setFeatureFlagForTest(FLAG, true);
        const seen = installLossyHook();

        const elm = renderScoped();
        const span = elm.shadowRoot.querySelector('[data-id="region"] span');

        // The scope token still marks the element, so the scoped rule (`span { color: rgb(1,2,3) }`)
        // still matches — this is the end-to-end proof scoping survived the lossy hook.
        expect(getComputedStyle(span).color).toBe('rgb(1, 2, 3)');

        // The scope *class* is present on the element (light-DOM + synthetic-shadow scoping).
        expect(span.getAttribute('class')).toMatch(SCOPE_TOKEN_RE);
        // The bare `lwc-<hash>` attribute is present in synthetic shadow (and absent in native).
        const bareScopeAttr = span
            .getAttributeNames()
            .find((n) => SCOPE_TOKEN_RE.test(n) && span.getAttribute(n) === '');
        expect(Boolean(bareScopeAttr)).toBe(EXPECT_BARE_SCOPE_ATTR);

        // The hook did run, and the markup it saw contained author content (the marker) but NOT the
        // engine scope token — i.e. the token was withheld from the sanitizer, not merely preserved.
        const markup = seen.find((m) => m.includes(MARKER));
        expect(markup).toBeDefined();
        expect(markup).not.toMatch(SCOPE_TOKEN_RE);
    }
);

it.skipIf(!SVG_STATIC_CONTENT_OPTIMIZATION_ENABLED)(
    'preserves the scope token on SVG and does not corrupt author SVG attributes through a lossy hook',
    () => {
        setFeatureFlagForTest(FLAG, true);
        const seen = installLossyHook();

        const elm = renderScopedSvg();
        const rect = elm.shadowRoot.querySelector('[data-id="region"] rect');

        // Scoped rule (`rect { fill: rgb(4,5,6) }`) still matches → token survived on the SVG child.
        expect(getComputedStyle(rect).fill).toBe('rgb(4, 5, 6)');
        expect(rect.getAttribute('class')).toMatch(SCOPE_TOKEN_RE);
        const bareScopeAttr = rect
            .getAttributeNames()
            .find((n) => SCOPE_TOKEN_RE.test(n) && rect.getAttribute(n) === '');
        expect(Boolean(bareScopeAttr)).toBe(EXPECT_BARE_SCOPE_ATTR);

        // Author attributes that ARE baked into the static fragment string (on the `<rect>`) survive
        // the hook untouched — withholding the scope token does not disturb author SVG content.
        expect(rect.getAttribute('width')).toBe('10');
        expect(rect.getAttribute('height')).toBe('10');

        // The hook saw the `<svg>`-wrapped author markup, but not the engine scope token.
        const markup = seen.find((m) => m.includes(MARKER));
        expect(markup).toBeDefined();
        expect(markup).toContain('<svg>');
        expect(markup).not.toMatch(SCOPE_TOKEN_RE);
    }
);
