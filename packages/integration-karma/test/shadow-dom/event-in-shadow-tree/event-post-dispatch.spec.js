// Inspired from WPT:
// https://github.com/web-platform-tests/wpt/blob/master/shadow-dom/event-post-dispatch.html

import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';

import Container from 'x/container';

function assertEventStateReset(event) {
    expect(event.eventPhase).toBe(0);
    expect(event.currentTarget).toBe(null);
    expect(event.composedPath().length).toBe(0);
}

function createComponent() {
    const element = createElement('x-container', { is: Container });
    element.setAttribute('data-id', 'x-container');
    document.body.appendChild(element);
    return extractDataIds(element);
}

describe('single shadow boundary', () => {
    describe('native element', () => {
        it('{ bubbles: true, composed: true }', () => {
            const nodes = createComponent();
            const event = new CustomEvent('test', { bubbles: true, composed: true });
            nodes.container_div.dispatchEvent(event);

            assertEventStateReset(event);
            expect(event.target).toBe(nodes['x-container']);
        });

        // WebKit bug - https://bugs.webkit.org/show_bug.cgi?id=206374
        // In Safari, the event target is not null.
        xit('{ bubbles: true, composed: false }', () => {
            const nodes = createComponent();
            const event = new CustomEvent('test', { bubbles: true, composed: false });
            nodes.container_div.dispatchEvent(event);

            assertEventStateReset(event);
            expect(event.target).toBe(null);
        });
    });

    describe('lwc:dom="manual" element', () => {
        it('{ bubbles: true, composed: true }', () => {
            const nodes = createComponent();
            const event = new CustomEvent('test', { bubbles: true, composed: true });
            nodes.container_span_manual.dispatchEvent(event);

            // lwc:dom=manual is async due to MutationObserver
            return Promise.resolve().then(() => {
                assertEventStateReset(event);
                expect(event.target).toBe(nodes['x-container']);
            });
        });

        // WebKit bug - https://bugs.webkit.org/show_bug.cgi?id=206374
        // In Safari, the event target is not null.
        xit('{ bubbles: true, composed: false }', () => {
            const nodes = createComponent();
            const event = new CustomEvent('test', { bubbles: true, composed: false });
            nodes.container_span_manual.dispatchEvent(event);

            // lwc:dom=manual is async due to MutationObserver
            return Promise.resolve().then(() => {
                assertEventStateReset(event);
                expect(event.target).toBe(null);
            });
        });
    });

    describe('component', () => {
        it('{ bubbles: true, composed: true }', () => {
            const nodes = createComponent();
            const event = new CustomEvent('test', { bubbles: true, composed: true });
            nodes['x-container'].dispatchEventComponent(event);

            assertEventStateReset(event);
            expect(event.target).toBe(nodes['x-container']);
        });

        it('{ bubbles: true, composed: false }', () => {
            const nodes = createComponent();
            const event = new CustomEvent('test', { bubbles: true, composed: false });
            nodes['x-container'].dispatchEventComponent(event);

            assertEventStateReset(event);
            expect(event.target).toBe(nodes['x-container']);
        });
    });
});
