import { createElement, setFeatureFlagForTest } from 'lwc';

import Lookup from 'x/lookup';

// Some third-party libraries (e.g. RUM / analytics agents) resolve an element by id relative to a
// node's root, obtained via `node.getRootNode()`. A well-behaved library feature-detects the method
// before using it and falls back to `querySelector('#' + id)` when it is unavailable:
//
//     function resolveById(root, id) {
//         if (typeof root.getElementById === 'function') {
//             return root.getElementById(id);
//         }
//         return root.querySelector('#' + id);
//     }
//
// On the synthetic ShadowRoot `getElementById` is intentionally not emulated. By default it is a
// throwing stub — which is worse than useless for these callers, because a stub is still a callable
// function (`typeof root.getElementById === 'function'` is `true`), so the guard passes, the caller
// invokes it, and it throws. The ENABLE_SHADOW_ROOT_UNDEFINED_METHODS runtime flag makes the method
// `undefined` instead, so the guard fails and the caller pivots to the supported, shadow-scoped
// `querySelector`. These tests exercise both states through the exact feature-detecting caller.
function resolveById(root, id) {
    if (typeof root.getElementById === 'function') {
        return root.getElementById(id);
    }
    return root.querySelector('#' + id);
}

describe.skipIf(process.env.NATIVE_SHADOW)('ShadowRoot.getElementById feature detection', () => {
    let shadowRoot;

    beforeAll(() => {
        const elm = createElement('x-lookup', { is: Lookup });
        // Must be connected so renderedCallback runs and injects the marker node.
        document.body.appendChild(elm);
        shadowRoot = elm.shadowRoot;
    });

    // Default (flag off): the throwing stub defeats feature detection — this is the reported bug.
    describe('by default (ENABLE_SHADOW_ROOT_UNDEFINED_METHODS off)', () => {
        it('exposes getElementById as a callable stub that defeats feature detection', () => {
            expect(typeof shadowRoot.getElementById).toBe('function');
        });

        it('reports getElementById as present via the `in` operator', () => {
            // `in` is true here and stays true flag-on (the own property shadows the native
            // DocumentFragment method), so it never distinguishes the two states.
            expect('getElementById' in shadowRoot).toBe(true);
        });

        it('makes a feature-detecting caller throw (the reported failure mode)', () => {
            // The guard passes (it IS a function), the caller invokes it, and it throws.
            expect(() => resolveById(shadowRoot, 'injected-marker')).toThrowError(
                `Disallowed method "getElementById" on ShadowRoot.`
            );
        });
    });

    // Opt-in (flag on): the method is absent, so the caller falls back to querySelector and works.
    describe('with ENABLE_SHADOW_ROOT_UNDEFINED_METHODS enabled', () => {
        beforeAll(() => {
            setFeatureFlagForTest('ENABLE_SHADOW_ROOT_UNDEFINED_METHODS', true);
        });

        afterAll(() => {
            setFeatureFlagForTest('ENABLE_SHADOW_ROOT_UNDEFINED_METHODS', false);
        });

        it('exposes getElementById as absent so feature detection reveals it', () => {
            expect(typeof shadowRoot.getElementById === 'function').toBe(false);
            expect(shadowRoot.getElementById).toBe(undefined);
        });

        it('still reports getElementById as present via the `in` operator (by design)', () => {
            // The own property remains (as undefined) to shadow the native DocumentFragment
            // method, so `in` cannot be used to detect absence — value-based checks must be used.
            expect('getElementById' in shadowRoot).toBe(true);
        });

        it('throws a plain TypeError — not the descriptive error — when an `in`-guarded caller invokes the undefined value', () => {
            // A caller that guards with `in` rather than a value check still enters the branch and
            // calls `undefined()`, which throws a native TypeError. This is deliberately distinct
            // from the flag-off throwing stub, whose descriptive `Disallowed method` Error is a
            // plain Error (not a TypeError) — so the two assertions below pin the exact error kind.
            const callViaInGuard = () => {
                if ('getElementById' in shadowRoot) {
                    return shadowRoot.getElementById('injected-marker');
                }
                return null;
            };
            expect(callViaInGuard).toThrowError(TypeError);
            expect(callViaInGuard).not.toThrowError(
                'Disallowed method "getElementById" on ShadowRoot.'
            );
        });

        it('silently no-ops for truthy-guard and optional-chaining callers', () => {
            // Pin the precondition inline so this test is self-contained: with the flag on, the
            // value is genuinely `undefined` (not a stub function), which is what makes the guards
            // below short-circuit rather than invoke-and-return-undefined.
            expect(shadowRoot.getElementById).toBe(undefined);

            // `if (root.getElementById)` skips the branch, and `root.getElementById?.(id)`
            // short-circuits — both yield undefined with no throw, rather than a resolved element.
            expect(shadowRoot.getElementById?.('injected-marker')).toBe(undefined);

            let result = 'unset';
            if (shadowRoot.getElementById) {
                result = shadowRoot.getElementById('injected-marker');
            }
            // The sentinel survives only if the truthy branch was skipped; had it been entered and
            // returned undefined, `result` would be undefined (≠ 'unset') and this would fail.
            expect(result).toBe('unset');
        });

        it('lets a feature-detecting caller resolve an element without throwing', () => {
            // The guard now fails and the caller falls back to querySelector — no throw.
            expect(() => resolveById(shadowRoot, 'injected-marker')).not.toThrow();
        });

        it('resolves the element end-to-end via the querySelector fallback', () => {
            const el = resolveById(shadowRoot, 'injected-marker');
            expect(el).not.toBeNull();
            expect(el.textContent).toBe('Injected Marker');
        });
    });

    // Some consumers monkey-patch the unsupported method with a working implementation. Before this
    // flag, `getElementById` was a plain `writable: true` data property, so `root.getElementById = fn`
    // just worked. Exposing it via an accessor (so the flag read stays dynamic) would break that — a
    // getter-only accessor throws on assignment in strict mode and silently drops it in sloppy mode —
    // so the descriptor pairs the getter with a setter that restores the writable-data-property
    // behavior. These tests pin that reassignment contract in both flag states.
    describe('preserves reassignment (writable) semantics', () => {
        // This spec module is an ES module, so these assignments run in strict mode — the case that
        // would throw against a getter-only accessor.
        it('allows replacing getElementById on an instance (flag off)', () => {
            const elm = createElement('x-lookup', { is: Lookup });
            const replacement = () => 'replaced';
            expect(() => {
                elm.shadowRoot.getElementById = replacement;
            }).not.toThrow();
            expect(elm.shadowRoot.getElementById).toBe(replacement);
            expect(elm.shadowRoot.getElementById()).toBe('replaced');
        });

        it('records the replacement as an own writable data property', () => {
            const elm = createElement('x-lookup', { is: Lookup });
            elm.shadowRoot.getElementById = () => 'replaced';
            const desc = Object.getOwnPropertyDescriptor(elm.shadowRoot, 'getElementById');
            expect(desc).toBeDefined();
            expect(desc.writable).toBe(true);
            expect(desc.enumerable).toBe(true);
            expect(desc.configurable).toBe(true);
            expect(typeof desc.value).toBe('function');
        });

        it('isolates the replacement to the reassigned instance', () => {
            const a = createElement('x-lookup', { is: Lookup });
            const b = createElement('x-lookup', { is: Lookup });
            a.shadowRoot.getElementById = () => 'replaced';
            // A sibling instance still sees the original throwing stub.
            expect(() => b.shadowRoot.getElementById()).toThrowError(
                `Disallowed method "getElementById" on ShadowRoot.`
            );
        });

        it('still allows replacing getElementById with the flag on', () => {
            // The setter is flag-independent: reassignment must keep working even when the getter
            // would otherwise return undefined. Guards against re-coupling the setter to the flag.
            setFeatureFlagForTest('ENABLE_SHADOW_ROOT_UNDEFINED_METHODS', true);
            try {
                const elm = createElement('x-lookup', { is: Lookup });
                const replacement = () => 'replaced';
                expect(() => {
                    elm.shadowRoot.getElementById = replacement;
                }).not.toThrow();
                expect(elm.shadowRoot.getElementById).toBe(replacement);
                const desc = Object.getOwnPropertyDescriptor(elm.shadowRoot, 'getElementById');
                expect(desc.writable).toBe(true);
                expect(typeof desc.value).toBe('function');
            } finally {
                setFeatureFlagForTest('ENABLE_SHADOW_ROOT_UNDEFINED_METHODS', false);
            }
        });
    });
});
