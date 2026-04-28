/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { registerLwcStyleComponent } from '@lwc/ssr-client-utils';

function addStyle(root, id, css) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    root.appendChild(style);
    return style;
}

function addMarker(parent, styleId, classes) {
    const marker = document.createElement('lwc-style');
    marker.setAttribute('style-id', styleId);
    if (classes) {
        marker.className = classes;
    }
    parent.appendChild(marker);
    return marker;
}

// In real browsers, connectedCallback errors may propagate through appendChild
// (Chromium) or be reported via the window error event (per spec). Handle both.
function expectConnectedError(fn, message) {
    let error;
    const originalOnError = window.onerror;
    window.onerror = () => {};
    const handler = (e) => {
        e.preventDefault();
        error = e.error;
    };
    window.addEventListener('error', handler);
    try {
        fn();
    } catch (e) {
        error = e;
    }
    window.removeEventListener('error', handler);
    window.onerror = originalOnError;
    expect(error).toBeDefined();
    expect(error.message).toMatch(message);
}

describe('ssr-client-utils', () => {
    before(() => {
        if (!customElements.get('lwc-style')) {
            registerLwcStyleComponent();
        }
    });

    afterEach(() => {
        window.__lwcClearStylesheetCache();
        document.adoptedStyleSheets = [];
        document.body.innerHTML = '';
        document.head.querySelectorAll('style').forEach((el) => el.remove());
    });

    it('registers the lwc-style custom element', () => {
        expect(customElements.get('lwc-style')).toBeDefined();
    });

    describe('first marker for a style-id', () => {
        it('removes itself from the DOM', () => {
            addStyle(document.head, 's1', '.x { color: red }');
            addMarker(document.body, 's1');

            expect(document.body.querySelector('lwc-style')).toBeNull();
        });

        it('does not push to adoptedStyleSheets', () => {
            addStyle(document.head, 's1', '.x { color: red }');
            addMarker(document.body, 's1');

            expect(document.adoptedStyleSheets).toHaveLength(0);
        });
    });

    describe('second marker for the same style-id', () => {
        it('pushes the cached stylesheet to adoptedStyleSheets', () => {
            addStyle(document.head, 's1', '.x { color: red }');
            addMarker(document.body, 's1');
            addMarker(document.body, 's1');

            expect(document.adoptedStyleSheets).toHaveLength(1);
        });

        it('replaces itself with a placeholder style element', () => {
            addStyle(document.head, 's1', '.x { color: red }');
            addMarker(document.body, 's1');
            addMarker(document.body, 's1');

            const placeholder = document.body.querySelector('style[type="text/css"]');
            expect(placeholder).not.toBeNull();
        });

        it('copies classList from the marker to the placeholder', () => {
            addStyle(document.head, 's1', '.x { color: red }');
            addMarker(document.body, 's1');
            addMarker(document.body, 's1', 'scoped-token lwc-abc123');

            const placeholder = document.body.querySelector('style[type="text/css"]');
            expect([...placeholder.classList]).toEqual(['scoped-token', 'lwc-abc123']);
        });

        it('applies styles to elements via adoptedStyleSheets', () => {
            addStyle(document.head, 's1', '.target { color: rgb(255, 0, 0) }');
            addMarker(document.body, 's1');
            addMarker(document.body, 's1');

            const el = document.createElement('div');
            el.className = 'target';
            document.body.appendChild(el);

            expect(getComputedStyle(el).color).toBe('rgb(255, 0, 0)');
        });
    });

    it('handles multiple independent style-ids', () => {
        addStyle(document.head, 'a', '.a { color: rgb(255, 0, 0) }');
        addStyle(document.head, 'b', '.b { color: rgb(0, 0, 255) }');

        addMarker(document.body, 'a');
        addMarker(document.body, 'b');
        addMarker(document.body, 'a');
        addMarker(document.body, 'b');

        expect(document.adoptedStyleSheets).toHaveLength(2);

        const elA = document.createElement('div');
        elA.className = 'a';
        document.body.appendChild(elA);

        const elB = document.createElement('div');
        elB.className = 'b';
        document.body.appendChild(elB);

        expect(getComputedStyle(elA).color).toBe('rgb(255, 0, 0)');
        expect(getComputedStyle(elB).color).toBe('rgb(0, 0, 255)');
    });

    describe('shadow DOM', () => {
        it('deduplicates styles within a shadow root', () => {
            const host = document.createElement('div');
            document.body.appendChild(host);
            const shadow = host.attachShadow({ mode: 'open' });

            addStyle(shadow, 'shadow-s1', '.in-shadow { color: rgb(0, 128, 0) }');
            addMarker(shadow, 'shadow-s1');
            addMarker(shadow, 'shadow-s1');

            expect(shadow.adoptedStyleSheets).toHaveLength(1);

            const el = document.createElement('div');
            el.className = 'in-shadow';
            shadow.appendChild(el);

            expect(getComputedStyle(el).color).toBe('rgb(0, 128, 0)');
        });

        it('does not leak adopted styles from the document into a shadow root', () => {
            addStyle(document.head, 'doc-only', '.leak-test { color: rgb(255, 0, 0) }');
            addMarker(document.body, 'doc-only');
            addMarker(document.body, 'doc-only');

            const host = document.createElement('div');
            document.body.appendChild(host);
            const shadow = host.attachShadow({ mode: 'open' });

            const el = document.createElement('div');
            el.className = 'leak-test';
            shadow.appendChild(el);

            expect(shadow.adoptedStyleSheets).toHaveLength(0);
            expect(getComputedStyle(el).color).not.toBe('rgb(255, 0, 0)');
        });
    });

    describe('error handling', () => {
        it('errors when style-id attribute is missing', () => {
            expectConnectedError(
                () => document.body.appendChild(document.createElement('lwc-style')),
                '"style-id" attribute must be supplied for <lwc-style> element'
            );
        });

        it('errors when matching style element is not found', () => {
            expectConnectedError(
                () => addMarker(document.body, 'nonexistent'),
                '<lwc-style> tag found with no corresponding <style id="nonexistent"> tag'
            );
        });
    });
});
