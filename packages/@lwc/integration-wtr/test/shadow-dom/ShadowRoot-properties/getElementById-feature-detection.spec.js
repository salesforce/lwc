import { createElement } from 'lwc';

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
// On the synthetic ShadowRoot `getElementById` is intentionally not emulated. It must therefore be
// feature-detectable as ABSENT: exposing it as a throwing stub is worse than not exposing it at all,
// because a stub is still a callable function — `typeof root.getElementById === 'function'` is `true`
// — so the guard passes and the caller invokes it, only for it to throw. Leaving it `undefined`
// makes the guard fail, so the caller pivots to the supported, shadow-scoped `querySelector`.
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

    it('exposes getElementById as absent (not a callable stub) so feature detection reveals it', () => {
        // The crux of the fix: detection must report the method as unavailable.
        expect(typeof shadowRoot.getElementById === 'function').toBe(false);
        expect(shadowRoot.getElementById).toBe(undefined);
    });

    it('lets a feature-detecting caller resolve an element without throwing', () => {
        // Before the fix, `getElementById` was a throwing stub: the guard above passed (it IS a
        // function), the caller invoked it, and it threw `Disallowed method "getElementById" ...`.
        // After the fix the guard fails and the caller falls back to querySelector — no throw.
        expect(() => resolveById(shadowRoot, 'injected-marker')).not.toThrow();
    });

    it('resolves the element end-to-end via the querySelector fallback', () => {
        const el = resolveById(shadowRoot, 'injected-marker');
        expect(el).not.toBeNull();
        expect(el.textContent).toBe('Injected Marker');
    });
});
