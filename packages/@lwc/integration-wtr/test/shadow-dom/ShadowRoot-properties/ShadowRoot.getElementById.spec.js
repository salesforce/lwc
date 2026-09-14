import { createElement, setFeatureFlagForTest } from 'lwc';

import Lookup from 'x/lookup';
import Nested from 'x/nested';

const FLAG = 'ENABLE_SHADOW_ROOT_GET_ELEMENT_BY_ID';

describe.skipIf(process.env.NATIVE_SHADOW)('ShadowRoot.getElementById', () => {
    // Default (flag off): the method is a stub that throws, matching the other disallowed
    // ShadowRoot methods (getSelection, cloneNode). See also ShadowRoot.spec.js.
    describe('by default (flag off)', () => {
        it('throws a descriptive error when invoked', () => {
            const elm = createElement('x-lookup', { is: Lookup });
            document.body.appendChild(elm);
            expect(() => elm.shadowRoot.getElementById('injected-marker')).toThrowError(
                `Disallowed method "getElementById" on ShadowRoot.`
            );
        });
    });

    // Opt-in (flag on): a real implementation that searches this shadow tree.
    describe('with the flag enabled', () => {
        let shadowRoot;

        beforeAll(() => {
            setFeatureFlagForTest(FLAG, true);
            const elm = createElement('x-lookup', { is: Lookup });
            document.body.appendChild(elm);
            shadowRoot = elm.shadowRoot;
        });

        afterAll(() => {
            setFeatureFlagForTest(FLAG, false);
        });

        it('resolves an element by its id', () => {
            const el = shadowRoot.getElementById('injected-marker');
            expect(el).not.toBeNull();
            expect(el.textContent).toBe('Injected Marker');
        });

        it('returns null for an id that is not present', () => {
            expect(shadowRoot.getElementById('does-not-exist')).toBeNull();
        });

        it('returns null for the empty string (matching native)', () => {
            // Native `getElementById('')` matches nothing; the naive `querySelector('#')` would throw.
            expect(shadowRoot.getElementById('')).toBeNull();
        });

        it('accepts ids that are not valid CSS identifiers', () => {
            // `querySelector('#2-weird.id')` would throw; getElementById must escape and resolve it.
            const el = shadowRoot.getElementById('2-weird.id');
            expect(el).not.toBeNull();
            expect(el.textContent).toBe('Weird Id');
        });

        it('returns the first match in tree order for duplicate ids', () => {
            const el = shadowRoot.getElementById('dup');
            expect(el).not.toBeNull();
            expect(el.textContent).toBe('First');
        });

        it('scopes the lookup to its own shadow tree', () => {
            // The child x-lookup injects its own `injected-marker`; owned by the child, it must not
            // leak into the parent's shadow root.
            const parent = createElement('x-nested', { is: Nested });
            document.body.appendChild(parent);
            expect(parent.shadowRoot.getElementById('injected-marker')).toBeNull();
            // ...but the child still finds its own marker.
            const child = parent.shadowRoot.querySelector('x-lookup');
            expect(child.shadowRoot.getElementById('injected-marker').textContent).toBe(
                'Injected Marker'
            );
        });
    });

    // The method is a plain writable data property (like querySelector), so consumers may
    // monkey-patch it per instance. This must hold regardless of the flag.
    describe('preserves reassignment (writable) semantics', () => {
        it('allows replacing getElementById on an instance', () => {
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
    });
});
