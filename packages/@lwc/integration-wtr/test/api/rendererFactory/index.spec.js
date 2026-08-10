import { createElement, rendererFactory, setFeatureFlagForTest } from 'lwc';
import Consumer from 'x/consumer';

// W-23656882: the publicly-exported `rendererFactory` is only meant to be recreated in a sandbox via
// `toString()`, never invoked directly. Invoking the export is now guarded so it throws by default,
// while `toString()` still yields the self-contained source that libraries such as Lightning Web
// Security recreate. See packages/@lwc/engine-dom/src/renderer-factory-guard.ts.

describe('rendererFactory invocation guard', () => {
    afterEach(() => {
        setFeatureFlagForTest('DISABLE_RENDERER_FACTORY_INVOCATION_GUARD', false);
    });

    it('throws when the exported rendererFactory is invoked directly', () => {
        expect(() => rendererFactory(null)).toThrowError(TypeError);
    });

    it('throws when a component invokes the exported rendererFactory', () => {
        const elm = createElement('x-consumer', { is: Consumer });
        document.body.appendChild(elm);
        elm.invokeRendererFactory();
        expect(elm.error).toBeInstanceOf(TypeError);
        expect(elm.result).toBeNull();
        document.body.removeChild(elm);
    });

    it('still exposes the self-contained factory source via toString() for sandbox recreation', () => {
        // Lightning Web Security recreates a sandboxed renderer with `sanitize(rendererFactory.toString())`.
        // The guard must not leak into that source, and the recreated factory must be a working factory.
        const source = rendererFactory.toString();
        expect(source).not.toContain('DISABLE_RENDERER_FACTORY_INVOCATION_GUARD');

        // eslint-disable-next-line no-eval
        const recreated = (0, eval)(`(${source})`);
        const recreatedRenderer = recreated(null);
        expect(recreatedRenderer.getProperty({ foo: 'bar' }, 'foo')).toBe('bar');
    });

    it('does not block invocation when DISABLE_RENDERER_FACTORY_INVOCATION_GUARD is true', () => {
        setFeatureFlagForTest('DISABLE_RENDERER_FACTORY_INVOCATION_GUARD', true);
        const renderer = rendererFactory(null);
        expect(typeof renderer.getProperty).toBe('function');
        expect(renderer.getProperty({ foo: 'bar' }, 'foo')).toBe('bar');
    });
});
