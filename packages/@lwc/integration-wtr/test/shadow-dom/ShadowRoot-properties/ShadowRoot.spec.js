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
// not emulated on the synthetic ShadowRoot — invoking any of them throws. Only `getElementById` has
// a genuine native-vs-synthetic feature-detection divergence (native `ShadowRoot` inherits a working
// one from `DocumentFragment`) with a `querySelector` fallback, so only *its* exposure is gated by
// the ENABLE_SHADOW_ROOT_UNDEFINED_METHODS runtime flag (see @lwc/synthetic-shadow shadow-root.ts).
// `getSelection`/`cloneNode` are plain throwing stubs the flag does not affect.
const DISALLOWED_METHODS = ['getSelection', 'cloneNode', 'getElementById'];
const FLAG_GATED_METHOD = 'getElementById';
const UNGATED_METHODS = DISALLOWED_METHODS.filter((m) => m !== FLAG_GATED_METHOD);

describe.skipIf(process.env.NATIVE_SHADOW)('synthetic-shadow restrictions', () => {
    let elm;

    beforeAll(() => {
        elm = createElement('x-test', { is: Test });
    });

    // Default behavior (flag off): all three methods are throwing stubs. This preserves the
    // long-standing behavior shipped to every synthetic-shadow consumer.
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

        // Write semantics must match the pre-flag `writable: true` data property: some consumers
        // monkey-patch these unsupported methods with a working implementation. `getSelection` and
        // `cloneNode` remain plain writable data properties, so this always held for them. The
        // flag-gated `getElementById` is exposed via an accessor (so the flag read stays dynamic),
        // and a getter-only accessor would break reassignment — throwing in strict mode, silently
        // dropping the write in sloppy mode; its paired setter restores the writable-data-property
        // behavior. This block asserts all three behave identically on reassignment.
        describe('preserves reassignment (writable) semantics', () => {
            DISALLOWED_METHODS.forEach((method) => {
                it(`allows replacing ShadowRoot.${method} on an instance (strict mode)`, () => {
                    // This spec module is an ES module, so this assignment runs in strict mode —
                    // the case that would throw against a getter-only accessor.
                    const fresh = createElement('x-test', { is: Test });
                    const replacement = () => 'replaced';
                    expect(() => {
                        fresh.shadowRoot[method] = replacement;
                    }).not.toThrow();
                    expect(fresh.shadowRoot[method]).toBe(replacement);
                    expect(fresh.shadowRoot[method]()).toBe('replaced');
                });

                it(`records the replacement as an own writable data property for ShadowRoot.${method}`, () => {
                    const fresh = createElement('x-test', { is: Test });
                    fresh.shadowRoot[method] = () => 'replaced';
                    const desc = Object.getOwnPropertyDescriptor(fresh.shadowRoot, method);
                    expect(desc).toBeDefined();
                    expect(desc.writable).toBe(true);
                    expect(desc.enumerable).toBe(true);
                    expect(desc.configurable).toBe(true);
                    expect(typeof desc.value).toBe('function');
                });

                it(`isolates the replacement of ShadowRoot.${method} to the reassigned instance`, () => {
                    const a = createElement('x-test', { is: Test });
                    const b = createElement('x-test', { is: Test });
                    a.shadowRoot[method] = () => 'replaced';
                    // A sibling instance still sees the original throwing stub.
                    expect(() => b.shadowRoot[method]()).toThrowError(
                        `Disallowed method "${method}" on ShadowRoot.`
                    );
                });
            });
        });
    });

    // Opt-in behavior (flag on): only `getElementById` becomes `undefined`, so feature detection
    // reveals its absence and callers fall back to the supported, shadow-scoped
    // `querySelector('#' + id)`. `getSelection`/`cloneNode` are unaffected by the flag.
    describe('with ENABLE_SHADOW_ROOT_UNDEFINED_METHODS enabled', () => {
        beforeAll(() => {
            setFeatureFlagForTest('ENABLE_SHADOW_ROOT_UNDEFINED_METHODS', true);
        });

        afterAll(() => {
            setFeatureFlagForTest('ENABLE_SHADOW_ROOT_UNDEFINED_METHODS', false);
        });

        it(`exposes ShadowRoot.${FLAG_GATED_METHOD} as undefined`, () => {
            expect(elm.shadowRoot[FLAG_GATED_METHOD]).toBe(undefined);
            expect(typeof elm.shadowRoot[FLAG_GATED_METHOD]).not.toBe('function');
        });

        it(`keeps '${FLAG_GATED_METHOD}' as an own property so it shadows DocumentFragment.prototype`, () => {
            // The property must still exist (as undefined) — deleting it would expose the
            // native DocumentFragment method, which runs against the empty fragment.
            expect(FLAG_GATED_METHOD in elm.shadowRoot).toBe(true);
        });

        it(`still allows replacing ShadowRoot.${FLAG_GATED_METHOD} with the flag on`, () => {
            // The setter that preserves writable-data-property write semantics is
            // flag-independent: reassignment must keep working even when the getter would
            // otherwise return undefined. Guards against re-coupling the setter to the flag.
            const fresh = createElement('x-test', { is: Test });
            const replacement = () => 'replaced';
            expect(() => {
                fresh.shadowRoot[FLAG_GATED_METHOD] = replacement;
            }).not.toThrow();
            expect(fresh.shadowRoot[FLAG_GATED_METHOD]).toBe(replacement);
            const desc = Object.getOwnPropertyDescriptor(fresh.shadowRoot, FLAG_GATED_METHOD);
            expect(desc.writable).toBe(true);
            expect(typeof desc.value).toBe('function');
        });

        // The flag is scoped to getElementById; the other unsupported methods must be untouched.
        UNGATED_METHODS.forEach((method) => {
            it(`leaves ShadowRoot.${method} as a throwing stub regardless of the flag`, () => {
                expect(typeof elm.shadowRoot[method]).toBe('function');
                expect(() => elm.shadowRoot[method]()).toThrowError(
                    `Disallowed method "${method}" on ShadowRoot.`
                );
            });
        });

        it('querySelector remains the supported shadow-scoped lookup', () => {
            // querySelector stays emulated and callable — the recommended fallback for id lookups
            // via querySelector('#' + id), unlike the now-absent getElementById.
            expect(typeof elm.shadowRoot.querySelector).toBe('function');
        });
    });
});
