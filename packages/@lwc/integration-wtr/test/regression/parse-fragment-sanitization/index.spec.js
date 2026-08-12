import { createElement, setFeatureFlagForTest } from 'lwc';
import StaticFragment from 'x/staticFragment';
import StaticSvgFragment from 'x/staticSvgFragment';
import { getHooks, setHooks } from '../../../helpers/hooks.js';
import { resetDOM, resetFragmentCache } from '../../../helpers/reset.js';

// W-23814957: the static-content optimization builds its fragment by assigning the
// component-authored markup to a host-realm `<template>.innerHTML` (see `createFragment` in
// @lwc/engine-dom). Because that assignment happens outside the sandbox, an embedding security
// layer never sees the markup and cannot strip content its sanitizer would otherwise remove. The
// opt-in `ENABLE_PARSE_FRAGMENT_SANITIZATION` flag routes the assembled markup through the same
// `sanitizeHtmlContent` hook that backs `lwc:inner-html` before it becomes DOM.
//
// This real-browser test exercises the actual host-realm sink (which the node/server unit test in
// engine-server cannot) and asserts the flag toggles whether the hook can act on static-content
// markup. It uses a benign marker attribute only — never a live payload; see the work item for the
// full report.

const FLAG = 'ENABLE_PARSE_FRAGMENT_SANITIZATION';
const MARKER = 'data-untrusted';

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

it('does not route static-content markup through the hook when the flag is unset (default)', () => {
    // A sanitizer that would strip the marker — it must never be consulted for static content by
    // default, and its stripping must therefore have no effect.
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

it('routes static-content markup through the hook when the flag is enabled', () => {
    setFeatureFlagForTest(FLAG, true);
    // A sanitizer that renames the benign marker attribute on whatever markup it is handed.
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
});

it('sanitizes the SVG-variant markup with its <svg> wrapper in place when the flag is enabled', () => {
    setFeatureFlagForTest(FLAG, true);
    // Same sanitizer, but record every markup string the hook is handed so we can assert the SVG
    // variant is sanitized in the same parsing context (namespace) the sink will use.
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

    // The SVG child's markup was handed to the hook already wrapped in <svg>...</svg> — i.e. in the
    // namespace the host-realm innerHTML sink will parse it in, not the raw pre-wrap markup.
    const svgMarkup = seen.find((m) => m.includes(MARKER));
    expect(svgMarkup).toBeDefined();
    expect(svgMarkup).toContain('<svg>');
    // ...and the sanitized result is what reached the live DOM.
    expect(rect.hasAttribute(MARKER)).toBe(false);
    expect(rect.hasAttribute('data-sanitized')).toBe(true);
});
