import { createElement, rendererFactory, setFeatureFlagForTest } from 'lwc';
import Component from 'x/component';

// Locker recreates `rendererFactory` from its source text. The original function closes over the real
// globals, so it must throw once the engine has initialized, while recreated copies must keep working.

const SEAL_KEY = Symbol.for('@lwc/engine-dom:rendererFactory:sealed');

function recreate() {
    // eslint-disable-next-line no-eval
    return (0, eval)('(' + String(rendererFactory) + ')');
}

// See W-23814927
describe('rendererFactory seal', () => {
    it('throws when the original is invoked directly', () => {
        expect(() => rendererFactory(null)).toThrowError(/more than once/);
    });

    it('throws when component code invokes the original', () => {
        const elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);
        expect(() => elm.buildRenderer()).toThrowError(/more than once/);
        document.body.removeChild(elm);
    });

    it('cannot be unsealed by deleting or overwriting the marker', () => {
        expect(Reflect.deleteProperty(rendererFactory, SEAL_KEY)).toBe(false);
        expect(Reflect.set(rendererFactory, SEAL_KEY, false)).toBe(false);
        expect(() => Object.defineProperty(rendererFactory, SEAL_KEY, { value: false })).toThrow();
        expect(() => rendererFactory(null)).toThrowError(/more than once/);
    });

    it('lets a recreated copy build a renderer once', () => {
        const copy = recreate();
        const renderer = copy(null);
        const div = document.createElement('div');
        div.id = 'probe';
        expect(renderer.getProperty(div, 'id')).toBe('probe');
        expect(() => copy(null)).toThrowError(/more than once/);
    });

    describe('with DISABLE_RENDERER_FACTORY_GUARD', () => {
        beforeEach(() => {
            setFeatureFlagForTest('DISABLE_RENDERER_FACTORY_GUARD', true);
        });

        afterEach(() => {
            setFeatureFlagForTest('DISABLE_RENDERER_FACTORY_GUARD', false);
        });

        it('lets the original be invoked repeatedly', () => {
            expect(() => rendererFactory(null)).not.toThrow();
            expect(() => rendererFactory(null)).not.toThrow();
        });

        it('lets a recreated copy be invoked repeatedly', () => {
            const copy = recreate();
            expect(() => copy(null)).not.toThrow();
            expect(() => copy(null)).not.toThrow();
        });
    });
});
