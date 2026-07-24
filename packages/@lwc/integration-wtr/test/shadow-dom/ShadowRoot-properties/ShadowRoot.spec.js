import { createElement, setFeatureFlagForTest } from 'lwc';

import Test from 'x/test';

it('ShadowRoot should throw a TypeError when invoking its constructor', () => {
    expect(() => new ShadowRoot()).toThrowError(TypeError);
});

it('ShadowRoot should be a DocumentFragment', () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    const { shadowRoot } = elm;
    expect(shadowRoot.nodeType).toBe(Node.DOCUMENT_FRAGMENT_NODE);
    expect(shadowRoot.nodeName).toBe('#document-fragment');
});

describe('Properties overrides', () => {
    describe('Node.previousSibling', () => {
        it('should always return null', () => {
            const elm = createElement('x-test', { is: Test });
            expect(elm.shadowRoot.previousSibling).toBe(null);
        });
    });

    describe('Node.nextSibling', () => {
        it('should always return null', () => {
            const elm = createElement('x-test', { is: Test });
            expect(elm.shadowRoot.nextSibling).toBe(null);
        });
    });

    describe('Node.nodeType', () => {
        it('should always return the DocumentFragment type', () => {
            const elm = createElement('x-test', { is: Test });
            expect(elm.shadowRoot.nodeType).toBe(Node.DOCUMENT_FRAGMENT_NODE);
        });
    });

    describe('Node.nodeValue', () => {
        it('should always return null', () => {
            const elm = createElement('x-test', { is: Test });
            expect(elm.shadowRoot.nodeValue).toBe(null);
        });
    });

    describe('Node.ownerDocument', () => {
        it('should return the document the node belong to', () => {
            const elm = createElement('x-test', { is: Test });
            expect(elm.shadowRoot.ownerDocument).toBe(document);
        });
    });

    describe('Node.parentElement', () => {
        it('should always return null', () => {
            const elm = createElement('x-test', { is: Test });
            expect(elm.shadowRoot.parentElement).toBe(null);
        });
    });

    describe('Node.parentNode', () => {
        it('should always return null', () => {
            const elm = createElement('x-test', { is: Test });
            expect(elm.shadowRoot.parentNode).toBe(null);
        });
    });
});

// `getElementById`, `getSelection`, and `cloneNode` have no correct shadow-scoped semantics and are
// not emulated on the synthetic ShadowRoot. How their absence is *exposed* is gated by the
// ENABLE_SHADOW_ROOT_UNDEFINED_METHODS runtime flag (see @lwc/synthetic-shadow shadow-root.ts).
const DISALLOWED_METHODS = ['getSelection', 'cloneNode', 'getElementById'];

describe.skipIf(process.env.NATIVE_SHADOW)('synthetic-shadow restrictions', () => {
    let elm;

    beforeAll(() => {
        elm = createElement('x-test', { is: Test });
    });

    // Default behavior (flag off): the methods are throwing stubs. This preserves the long-standing
    // behavior shipped to every synthetic-shadow consumer.
    describe('by default (ENABLE_SHADOW_ROOT_UNDEFINED_METHODS off)', () => {
        DISALLOWED_METHODS.forEach((method) => {
            it(`should throw when invoking ShadowRoot.${method}`, () => {
                expect(() => elm.shadowRoot[method]()).toThrowError(
                    `Disallowed method "${method}" on ShadowRoot.`
                );
            });

            it(`exposes ShadowRoot.${method} as a callable function`, () => {
                // The crux of the problem the flag addresses: a throwing stub still passes
                // `typeof === 'function'` feature detection, so callers commit to invoking it.
                expect(typeof elm.shadowRoot[method]).toBe('function');
            });
        });
    });

    // Opt-in behavior (flag on): the methods are `undefined`, so feature detection reveals their
    // absence and callers fall back to the supported, shadow-scoped `querySelector('#' + id)`.
    describe('with ENABLE_SHADOW_ROOT_UNDEFINED_METHODS enabled', () => {
        beforeAll(() => {
            setFeatureFlagForTest('ENABLE_SHADOW_ROOT_UNDEFINED_METHODS', true);
        });

        afterAll(() => {
            setFeatureFlagForTest('ENABLE_SHADOW_ROOT_UNDEFINED_METHODS', false);
        });

        DISALLOWED_METHODS.forEach((method) => {
            it(`exposes ShadowRoot.${method} as undefined`, () => {
                expect(elm.shadowRoot[method]).toBe(undefined);
                expect(typeof elm.shadowRoot[method]).not.toBe('function');
            });

            it(`keeps '${method}' as an own property so it shadows DocumentFragment.prototype`, () => {
                // The property must still exist (as undefined) — deleting it would expose the
                // native DocumentFragment method, which runs against the empty fragment.
                expect(method in elm.shadowRoot).toBe(true);
            });
        });

        it('querySelector remains the supported shadow-scoped lookup', () => {
            // querySelector stays emulated and callable — the recommended fallback for id lookups
            // via querySelector('#' + id), unlike the now-absent getElementById.
            expect(typeof elm.shadowRoot.querySelector).toBe('function');
        });
    });
});
