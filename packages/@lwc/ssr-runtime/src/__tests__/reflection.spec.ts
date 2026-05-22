import { describe, test, expect, beforeEach } from 'vitest';
import { LightningElement, SYMBOL__SET_INTERNALS } from '../lightning-element';

describe('reflection', () => {
    class TestElement extends LightningElement {}

    beforeEach(() => {
        if (!(globalThis as any).lwcRuntimeFlags) {
            (globalThis as any).lwcRuntimeFlags = {};
        }
    });

    function createElement() {
        const el = new TestElement({ tagName: 'x-test' });
        el[SYMBOL__SET_INTERNALS]({}, {}, new Set());
        return el;
    }

    test('title reflection - get and set', () => {
        const el = createElement();

        // Test getter when no attribute
        expect(el.title).toBe(null);

        // Test setter
        el.title = 'Test Title';
        expect(el.getAttribute('title')).toBe('Test Title');
        expect(el.title).toBe('Test Title');

        // Test setting same value (should not re-set)
        el.title = 'Test Title';
        expect(el.title).toBe('Test Title');

        // Test setting different value
        el.title = 'New Title';
        expect(el.title).toBe('New Title');
    });

    test('id reflection - get and set', () => {
        const el = createElement();

        expect(el.id).toBe(null);

        el.id = 'test-id';
        expect(el.getAttribute('id')).toBe('test-id');
        expect(el.id).toBe('test-id');
    });

    test('tabIndex reflection - numeric conversion', () => {
        const el = createElement();

        // Default is 0 (Number(null) is 0)
        expect(el.tabIndex).toBe(0);

        // Set valid number
        el.tabIndex = 0;
        expect(el.getAttribute('tabindex')).toBe('0');
        expect(el.tabIndex).toBe(0);

        // Set same value again (should not re-set)
        el.tabIndex = 0;
        expect(el.tabIndex).toBe(0);

        // Set another valid number
        el.tabIndex = 5;
        expect(el.tabIndex).toBe(5);

        // Set invalid (should return -1 for non-finite)
        el.tabIndex = NaN as any;
        expect(el.tabIndex).toBe(-1); // NaN is not finite
    });

    test('draggable reflection - explicit boolean', () => {
        const el = createElement();

        // Default when not set
        expect(el.draggable).toBe(true);

        // Set to true
        el.draggable = true;
        expect(el.getAttribute('draggable')).toBe('true');
        expect(el.draggable).toBe(true);

        // Set to false (opposite of default)
        el.draggable = false;
        expect(el.getAttribute('draggable')).toBe('false');
        expect(el.draggable).toBe(false);

        // Test edge case: set attribute to "false"
        el.setAttribute('draggable', 'false');
        expect(el.draggable).toBe(false);

        // Test edge case: anything other than "true" when default is true
        el.setAttribute('draggable', 'yes');
        expect(el.draggable).toBe(false);
    });

    test('spellcheck reflection - explicit boolean with opposite default', () => {
        const el = createElement();

        // Default when not set
        expect(el.spellcheck).toBe(false);

        // Set to true (opposite of default)
        el.spellcheck = true;
        expect(el.getAttribute('spellcheck')).toBe('true');
        expect(el.spellcheck).toBe(true);

        // Set to false (back to default)
        el.spellcheck = false;
        expect(el.getAttribute('spellcheck')).toBe('false');
        expect(el.spellcheck).toBe(false);

        // Test edge case: set attribute to "true"
        el.setAttribute('spellcheck', 'true');
        expect(el.spellcheck).toBe(true);

        // Test edge case: anything other than "false" when default is false
        el.setAttribute('spellcheck', 'yes');
        expect(el.spellcheck).toBe(true);
    });

    test('hidden reflection - boolean attribute', () => {
        const el = createElement();

        // Default is false when not present
        expect(el.hidden).toBe(false);

        // Set to true
        el.hidden = true;
        expect(el.hasAttribute('hidden')).toBe(true);
        expect(el.hidden).toBe(true);

        // Set to false
        el.hidden = false;
        expect(el.hasAttribute('hidden')).toBe(false);
        expect(el.hidden).toBe(false);

        // Test presence of attribute with any value
        el.setAttribute('hidden', '');
        expect(el.hidden).toBe(true);
    });

    test('role reflection', () => {
        const el = createElement();

        expect(el.role).toBeNull();

        el.role = 'button';
        expect(el.getAttribute('role')).toBe('button');
        expect(el.role).toBe('button');

        // Setting to null should remove it
        el.role = null;
        expect(el.hasAttribute('role')).toBe(false);
    });

    test('ariaLabel reflection (ARIA property)', () => {
        const el = createElement();

        expect(el.ariaLabel).toBeNull();

        el.ariaLabel = 'Click me';
        expect(el.getAttribute('aria-label')).toBe('Click me');
        expect(el.ariaLabel).toBe('Click me');

        // Setting to null
        el.ariaLabel = null;
        expect(el.hasAttribute('aria-label')).toBe(false);
    });

    test('ariaHidden reflection', () => {
        const el = createElement();

        expect(el.ariaHidden).toBeNull();

        el.ariaHidden = 'true';
        expect(el.getAttribute('aria-hidden')).toBe('true');
        expect(el.ariaHidden).toBe('true');

        el.ariaHidden = 'false';
        expect(el.ariaHidden).toBe('false');
    });
});
