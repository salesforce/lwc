import { createElement, rendererFactory, renderer, setFeatureFlagForTest } from 'lwc';
import Probe from 'x/probe';

// W-23814927: `rendererFactory` is a self-contained function that external libraries may recreate by
// reading its source (via `Function.prototype.toString`) and re-evaluating it in another realm. It is
// also expected to build a renderer exactly once per realm — the engine's own bootstrap of the base
// `renderer`. When ENABLE_RENDERER_FACTORY_GUARD is set, any later invocation throws. The flag defaults
// off, so by default the factory stays freely re-invocable.
//
// The bootstrap invocation has already run by the time these tests execute, so any call here is a
// later invocation. `setFeatureFlagForTest` is a no-op in production, so the flag-on assertions are
// skipped there.

// The source reader external libraries use: `Reflect.apply(Function.prototype.toString, fn, [])` reads
// the function's real source text and is not affected by any own `toString` property on `fn`.
function sourceOf(fn) {
    return Reflect.apply(Function.prototype.toString, fn, []);
}

// Recreate the function from its source the way an external library does, then return the new function.
// Indirect eval evaluates in global scope, so any variable the source closed over would be unresolved
// here and throw when the function runs — which is exactly what proves the source is self-contained.
function recreate(source) {
    // eslint-disable-next-line no-eval
    return (0, eval)('(' + source + ')');
}

describe('rendererFactory single-invocation invariant (W-23814927)', () => {
    afterEach(() => {
        setFeatureFlagForTest('ENABLE_RENDERER_FACTORY_GUARD', false);
    });

    it('renders a component after the engine bootstrap invocation', () => {
        // Sanity check: the fixture mounts and the engine bootstrap (which invokes the factory once)
        // completed without being rejected.
        const elm = createElement('x-probe', { is: Probe });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.querySelector('p').textContent).toBe('rendererFactory invariant');
        document.body.removeChild(elm);
    });

    it('keeps rendererFactory re-invocable when the flag is off (default, legacy behavior)', () => {
        // With the flag unset (the default), the exported factory stays freely callable exactly as it
        // did before: no behavior change for the overwhelming majority of consumers.
        expect(() => rendererFactory({})).not.toThrow();
        const rebuilt = rendererFactory({});
        expect(typeof rebuilt.getProperty).toBe('function');
        const div = document.createElement('div');
        div.id = 'probe';
        expect(rebuilt.getProperty(div, 'id')).toBe('probe');
    });

    it('exposes free-variable-free source under Function.prototype.toString and recreates cleanly', () => {
        // The source read via the reader external libraries use must be self-contained: recreating it
        // and invoking it must not throw a ReferenceError for any variable captured from the module.
        const source = sourceOf(rendererFactory);
        // The source reads its state through globals, never through a `globalThis.`-qualified reference,
        // so that expression form must not appear.
        expect(source).not.toContain('globalThis.lwcRuntimeFlags');
        // Recreate and invoke twice. Any variable captured from the module would be unresolved in this
        // global eval scope and throw; the only global the source relies on is the flag, guarded by
        // `typeof`. The flag defaults off, so the invariant check is inert and both calls must succeed
        // with a working renderer.
        const recreated = recreate(source);
        for (let i = 0; i < 2; i++) {
            const rebuilt = recreated(null);
            expect(typeof rebuilt.getProperty).toBe('function');
            const div = document.createElement('div');
            div.id = 'probe';
            expect(rebuilt.getProperty(div, 'id')).toBe('probe');
        }
    });

    describe.skipIf(process.env.NODE_ENV === 'production')('flag enabled', () => {
        it('rejects a later invocation of the exported rendererFactory', () => {
            setFeatureFlagForTest('ENABLE_RENDERER_FACTORY_GUARD', true);
            // The engine's bootstrap already consumed the one expected invocation, so any call now is a
            // later invocation and must throw.
            expect(() => rendererFactory({})).toThrowError(/already been created/);
        });

        it('rejects a later invocation reached through component code', () => {
            setFeatureFlagForTest('ENABLE_RENDERER_FACTORY_GUARD', true);
            const elm = createElement('x-probe', { is: Probe });
            document.body.appendChild(elm);
            expect(() => elm.rebuildRenderer()).toThrowError(/already been created/);
            document.body.removeChild(elm);
        });

        it('leaves the already-bootstrapped base renderer intact', () => {
            setFeatureFlagForTest('ENABLE_RENDERER_FACTORY_GUARD', true);
            // Enabling the flag must not disturb the base renderer the engine built at bootstrap;
            // rendering must keep working.
            expect(typeof renderer.getProperty).toBe('function');
            const elm = createElement('x-probe', { is: Probe });
            document.body.appendChild(elm);
            expect(elm.shadowRoot.querySelector('p').textContent).toBe('rendererFactory invariant');
            document.body.removeChild(elm);
        });
    });
});
