import { createElement, setFeatureFlagForTest } from 'lwc';

import Lookup from 'x/lookup';

// Feature-detecting caller, as used by RUM/analytics libraries that resolve an id off
// `node.getRootNode()`: use `getElementById` if present, else fall back to `querySelector`. On the
// synthetic ShadowRoot the default throwing stub passes the guard and then throws; the
// ENABLE_SHADOW_ROOT_UNDEFINED_METHODS flag makes it `undefined` so the caller falls back instead.
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
            // Stays true flag-on too (the own property shadows the native method), so `in` never
            // distinguishes the two states.
            expect('getElementById' in shadowRoot).toBe(true);
        });

        it('makes a feature-detecting caller throw (the reported failure mode)', () => {
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
            // The own property remains (as undefined) to shadow the native method, so `in` can't
            // detect absence — value-based checks must be used.
            expect('getElementById' in shadowRoot).toBe(true);
        });

        it('throws a plain TypeError — not the descriptive error — when an `in`-guarded caller invokes the undefined value', () => {
            // An `in`-guarded caller enters the branch and calls `undefined()` → native TypeError,
            // distinct from the flag-off stub's descriptive (plain-Error) throw. Both assertions
            // below pin the exact error kind.
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
            // Precondition: genuinely `undefined` (not a stub), which is what makes the guards below
            // short-circuit rather than invoke-and-return-undefined.
            expect(shadowRoot.getElementById).toBe(undefined);

            expect(shadowRoot.getElementById?.('injected-marker')).toBe(undefined);

            let result = 'unset';
            if (shadowRoot.getElementById) {
                result = shadowRoot.getElementById('injected-marker');
            }
            // The sentinel survives only if the branch was skipped — entering it would set `result`
            // to undefined and fail here.
            expect(result).toBe('unset');
        });

        it('lets a feature-detecting caller resolve an element without throwing', () => {
            expect(() => resolveById(shadowRoot, 'injected-marker')).not.toThrow();
        });

        it('resolves the element end-to-end via the querySelector fallback', () => {
            const el = resolveById(shadowRoot, 'injected-marker');
            expect(el).not.toBeNull();
            expect(el.textContent).toBe('Injected Marker');
        });
    });

    // Some consumers monkey-patch the method with a working implementation. It was a plain
    // `writable` data property before this flag; the accessor's paired setter must preserve that
    // `root.getElementById = fn` behavior (a getter-only accessor would throw on assignment in
    // strict mode). Assignments below run in strict mode (ES module). Pinned in both flag states.
    describe('preserves reassignment (writable) semantics', () => {
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
            // Guards against re-coupling the setter to the flag: reassignment must work even when
            // the getter would otherwise return undefined.
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
