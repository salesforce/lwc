import { createElement, setFeatureFlagForTest } from 'lwc';

import Lookup from 'x/lookup';

// A feature-detecting caller: use `getElementById` if present, else fall back to `querySelector`.
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
        document.body.appendChild(elm);
        shadowRoot = elm.shadowRoot;
    });

    // Default (flag off): the throwing stub defeats feature detection — this is the reported bug.
    describe('by default (ENABLE_SHADOW_ROOT_UNDEFINED_GET_ELEMENT_BY_ID off)', () => {
        it('exposes getElementById as a callable stub that defeats feature detection', () => {
            expect(typeof shadowRoot.getElementById).toBe('function');
        });

        it('reports getElementById as present via the `in` operator', () => {
            // True flag-on too — the own property shadows the native method — so `in` never distinguishes them.
            expect('getElementById' in shadowRoot).toBe(true);
        });

        it('makes a feature-detecting caller throw (the reported failure mode)', () => {
            expect(() => resolveById(shadowRoot, 'injected-marker')).toThrowError(
                `Disallowed method "getElementById" on ShadowRoot.`
            );
        });
    });

    // Opt-in (flag on): the method is absent, so the caller falls back to querySelector and works.
    describe('with ENABLE_SHADOW_ROOT_UNDEFINED_GET_ELEMENT_BY_ID enabled', () => {
        beforeAll(() => {
            setFeatureFlagForTest('ENABLE_SHADOW_ROOT_UNDEFINED_GET_ELEMENT_BY_ID', true);
        });

        afterAll(() => {
            setFeatureFlagForTest('ENABLE_SHADOW_ROOT_UNDEFINED_GET_ELEMENT_BY_ID', false);
        });

        it('exposes getElementById as absent so feature detection reveals it', () => {
            expect(typeof shadowRoot.getElementById === 'function').toBe(false);
            expect(shadowRoot.getElementById).toBe(undefined);
        });

        it('still reports getElementById as present via the `in` operator (by design)', () => {
            // The own property (now undefined) still shadows the native method, so `in` can't detect absence.
            expect('getElementById' in shadowRoot).toBe(true);
        });

        it('throws a plain TypeError — not the descriptive error — when an `in`-guarded caller invokes the undefined value', () => {
            // Enters the branch, calls `undefined()` → native TypeError, not the flag-off stub's descriptive throw.
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
            expect(shadowRoot.getElementById).toBe(undefined);
            expect(shadowRoot.getElementById?.('injected-marker')).toBe(undefined);

            let result = 'unset';
            if (shadowRoot.getElementById) {
                result = shadowRoot.getElementById('injected-marker');
            }
            // The sentinel survives only if the guard skipped the branch.
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

    // Consumers may monkey-patch the method, so the accessor's setter must preserve the old
    // `writable` data-property behavior (a getter-only accessor throws on assignment in strict mode).
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
            setFeatureFlagForTest('ENABLE_SHADOW_ROOT_UNDEFINED_GET_ELEMENT_BY_ID', true);
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
                setFeatureFlagForTest('ENABLE_SHADOW_ROOT_UNDEFINED_GET_ELEMENT_BY_ID', false);
            }
        });
    });
});
