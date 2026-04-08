import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { LightningElement, SYMBOL__SET_INTERNALS } from '../lightning-element';

describe('LightningElement SSR Polyfill', () => {
    beforeEach(() => {
        if (!(globalThis as any).lwcRuntimeFlags) {
            (globalThis as any).lwcRuntimeFlags = {};
        }
    });

    function createTestElement(props = {}, attrs = {}) {
        const el = new LightningElement({ tagName: 'x-test' });
        el[SYMBOL__SET_INTERNALS](props, attrs, new Set());
        return el;
    }

    describe('Unsupported Environment Methods', () => {
        it('throws appropriate errors for DOM properties', () => {
            const el = createTestElement();

            expect(() => el.children).toThrow('"getChildren" is not supported');
            expect(() => el.childNodes).toThrow('"getChildNodes" is not supported');
            expect(() => el.firstChild).toThrow('"getFirstChild" is not supported');
            expect(() => el.firstElementChild).toThrow('"getFirstElementChild" is not supported');
            expect(() => el.hostElement).toThrow('this.hostElement is not supported');
            expect(() => el.lastChild).toThrow('"getLastChild" is not supported');
            expect(() => el.lastElementChild).toThrow('"getLastElementChild" is not supported');
            expect(() => el.ownerDocument).toThrow('"ownerDocument" is not supported');
            expect(() => el.style).toThrow('"style" is not supported');
        });

        it('throws appropriate errors for DOM methods', () => {
            const el = createTestElement();

            expect(() => el.attachInternals()).toThrow('"attachInternals" is not supported');
            expect(() => el.dispatchEvent(null as any)).toThrow('"dispatchEvent" is not supported');
            expect(() => el.getBoundingClientRect()).toThrow(
                '"getBoundingClientRect" is not supported'
            );
            expect(() => el.getElementsByClassName('test')).toThrow(
                '"getElementsByClassName" is not supported'
            );
            expect(() => el.getElementsByTagName('div')).toThrow(
                '"getElementsByTagName" is not supported'
            );
            expect(() => el.querySelector('.test')).toThrow('"querySelector" is not supported');
            expect(() => el.querySelectorAll('.test')).toThrow(
                '"querySelectorAll" is not supported'
            );
        });

        it('throws appropriate errors for Namespace methods', () => {
            const el = createTestElement();

            expect(() => el.getAttributeNS(null, 'test')).toThrow(
                'Method "getAttributeNS" not implemented'
            );
            expect(() => el.hasAttributeNS(null, 'test')).toThrow(
                'Method "hasAttributeNS" not implemented'
            );
            expect(() => el.removeAttributeNS(null, 'test')).toThrow(
                'Method "removeAttributeNS" not implemented'
            );
            expect(() => el.setAttributeNS(null, 'test', 'value')).toThrow(
                'Method "setAttributeNS" not implemented'
            );
        });
    });

    describe('Experimental Signals (Line 92)', () => {
        afterEach(() => {
            (globalThis as any).lwcRuntimeFlags.ENABLE_EXPERIMENTAL_SIGNALS = false;
        });

        it('calls connectContext when signals are enabled', () => {
            (globalThis as any).lwcRuntimeFlags.ENABLE_EXPERIMENTAL_SIGNALS = true;

            expect(() => {
                createTestElement();
            }).not.toThrow();
        });
    });

    describe('Event Listeners', () => {
        it('noop methods do not throw', () => {
            const el = createTestElement();
            expect(() => el.addEventListener('click', () => {})).not.toThrow();
            expect(() => el.removeEventListener('click', () => {})).not.toThrow();
        });
    });

    describe('Template property', () => {
        it('returns synthetic: false', () => {
            const el = createTestElement();
            expect(el.template).toEqual({ synthetic: false });
        });
    });
});
