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
});
