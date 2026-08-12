/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
    LightningElement,
    parseFragment,
    registerComponent,
    registerTemplate,
    renderComponent,
    setFeatureFlagForTest,
    setHooks,
} from '../index';
import type { FeatureFlagName } from '@lwc/features/dist/types';

// W-23814957: the static-content optimization (`parseFragment`) assembles the component-authored
// markup for a static element and hands it to the renderer, which turns it into DOM (in the
// browser, via a host-realm `<template>.innerHTML`). That sink is not visible to an embedding
// security layer, so the markup would bypass the same `sanitizeHtmlContent` hook that
// `lwc:inner-html` is routed through. The opt-in flag re-routes the assembled markup through that
// hook before it becomes a fragment. This suite drives the engine-core `buildParseFragmentFn`
// code path via the server renderer (synchronous, no browser) and asserts the flag genuinely
// toggles that routing — using a benign marker only, never a live payload.
//
// NOTE: engine-server's vitest resolves `@lwc/engine-core` from its built `dist`, so this suite
// only reflects source changes to `template.ts` after a rebuild. CI builds all packages via the
// root `prepare` script during `yarn install`, so the fix is present there.
const FLAG: FeatureFlagName = 'ENABLE_PARSE_FRAGMENT_SANITIZATION';

// A benign, marker-only attribute standing in for "markup a sanitizer would act on".
const MARKER = 'data-untrusted';

// The sanitizer an embedding security layer installs, delegated to per test. `setHooks` may only be
// called once per module registry, so a single delegating hook is installed and its target swapped
// (same indirection as integration-wtr/helpers/hooks.js).
let sanitizeImpl: (content: unknown) => string = (content) => String(content);
beforeAll(() => {
    try {
        setHooks({ sanitizeHtmlContent: (content) => sanitizeImpl(content) });
    } catch {
        // Already overridden in this registry — the delegating hook is in place.
    }
});

// `setFeatureFlagForTest` is intentionally a no-op in production. Temporarily drop out of production
// mode so the flag can be toggled (matching this package's `fixtures.spec.ts` helper), so the
// "flag enabled" assertions run in production mode too — where the fix actually ships.
function setFlagAllModes(value: boolean): void {
    const original = process.env.NODE_ENV;
    if (original === 'production') {
        process.env.NODE_ENV = 'development';
    }
    setFeatureFlagForTest(FLAG, value);
    if (original === 'production') {
        process.env.NODE_ENV = original;
    }
}

// Hand-authored equivalent of what the template compiler emits for a static element (see any
// fixture `dist/compiled-default.js`): a `parseFragment` tagged template consumed by `$api.st`.
// A fresh component ctor per invocation keeps each render independent.
function makeComponent(tag: string) {
    // Call form (rather than the tagged-template form the compiler emits) so a single mutable
    // `string[]` with no interpolated keys typechecks; `buildParseFragmentFn` simply concatenates
    // `strings`, so this is equivalent to `parseFragment`...`` for a static fragment.
    const fragment = parseFragment(['<div data-region><span data-untrusted></span></div>']);
    function tmpl($api: any) {
        const { st: api_static_fragment } = $api;
        return [api_static_fragment(fragment, 1)];
    }
    const _tmpl = registerTemplate(tmpl);
    (tmpl as any).stylesheets = [];
    class StaticFragmentCmp extends LightningElement {}
    return registerComponent(StaticFragmentCmp, { tmpl: _tmpl, sel: tag } as any) as any;
}

describe('parseFragment sanitization (W-23814957)', () => {
    afterEach(() => {
        setFlagAllModes(false);
        sanitizeImpl = (content) => String(content);
    });

    it('does NOT route static-content markup through the hook when the flag is unset (default)', () => {
        const spy = vi.fn((content: unknown) => String(content));
        sanitizeImpl = spy;

        const html = renderComponent('x-parse-fragment-off', makeComponent('x-parse-fragment-off'));

        // Default behavior is preserved: the hook is never consulted for static content...
        expect(spy).not.toHaveBeenCalled();
        // ...and the authored markup reaches the fragment unchanged.
        expect(html).toContain(MARKER);
    });

    it('routes static-content markup through the hook when the flag is enabled', () => {
        // A sanitizer that strips the benign marker attribute from whatever markup it is given.
        const spy = vi.fn((content: unknown) => String(content).replaceAll(' ' + MARKER, ''));
        sanitizeImpl = spy;
        setFlagAllModes(true);

        const html = renderComponent('x-parse-fragment-on', makeComponent('x-parse-fragment-on'));

        // The hook saw the fully assembled fragment markup...
        expect(spy).toHaveBeenCalled();
        expect(spy.mock.calls[0][0]).toContain(MARKER);
        // ...and its return value is what became the fragment: the marker no longer reaches output.
        expect(html).not.toContain(MARKER);
    });
});
