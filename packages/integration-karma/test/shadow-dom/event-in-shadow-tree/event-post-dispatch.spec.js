// Inspired from WPT:
// https://github.com/web-platform-tests/wpt/blob/master/shadow-dom/event-post-dispatch.html

import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';

import ShadowTree from 'x/shadowTree';
import NestedShadowTree from 'x/nestedShadowTree';

function createShadowTree(parentNode) {
    const elm = createElement('x-shadow-tree', { is: ShadowTree });
    elm.setAttribute('data-id', 'x-shadow-tree');
    parentNode.appendChild(elm);

    return extractDataIds(elm);
}

function assertEventStateReset(evt) {
    expect(evt.eventPhase).toBe(0);
    expect(evt.currentTarget).toBe(null);
    expect(evt.composedPath().length).toBe(0);
}

function createNestedShadowTree(parentNode) {
    const elm = createElement('x-nested-shadow-tree', { is: NestedShadowTree });
    elm.setAttribute('data-id', 'x-nested-shadow-tree');
    parentNode.appendChild(elm);

    return extractDataIds(elm);
}

// TODO [#1129]: Invoking dispatchEvent on nodes rendered by the template doesn't respect retargetting
if (process.env.NATIVE_SHADOW) {
    describe('Event properties post dispatch on node in a shadow tree', () => {
        let nodes;
        beforeAll(() => {
            nodes = createShadowTree(document.body);
        });

        it('element (composed: true)', () => {
            const evt = new CustomEvent('test', { composed: true, bubbles: true });
            nodes.span.dispatchEvent(evt);
            assertEventStateReset(evt);
            expect(evt.target).toBe(nodes['x-shadow-tree']);
        });

        // WebKit bug - https://bugs.webkit.org/show_bug.cgi?id=206374
        // In Safari, the event target is not null.
        xit('element (composed: false)', () => {
            const evt = new CustomEvent('test', { bubbles: true });
            nodes.span.dispatchEvent(evt);

            assertEventStateReset(evt);
            expect(evt.target).toBe(null);
        });

        it('element added via lwc:dom="manual" (composed: true)', () => {
            const evt = new CustomEvent('test', { composed: true, bubbles: true });
            nodes['span-manual'].dispatchEvent(evt);

            assertEventStateReset(evt);
            expect(evt.target).toBe(nodes['x-shadow-tree']);
        });

        // WebKit bug - https://bugs.webkit.org/show_bug.cgi?id=206374
        // In Safari, the event target is not null.
        xit('element added via lwc:dom="manual" (composed: false)', () => {
            const evt = new CustomEvent('test', { bubbles: true });
            nodes['span-manual'].dispatchEvent(evt);

            assertEventStateReset(evt);
            expect(evt.target).toBe(null);
        });

        it('component (composed: true)', () => {
            const evt = new CustomEvent('test', { composed: true, bubbles: true });
            nodes['x-shadow-tree'].dispatchEventComponent(evt);

            expect(evt.target).toBe(nodes['x-shadow-tree']);
            assertEventStateReset(evt);
        });

        // WebKit bug - https://bugs.webkit.org/show_bug.cgi?id=206374
        // In Safari, the event target is not null.
        xit('component (composed: false)', () => {
            const evt = new CustomEvent('test', { bubbles: true });
            nodes['x-shadow-tree'].dispatchEventComponent(evt);

            assertEventStateReset(evt);
            expect(evt.target).toBe(nodes['x-shadow-tree']);
        });
    });

    describe('Event properties post dispatch on node in a nested shadow tree', () => {
        let nodes;
        beforeAll(() => {
            nodes = createNestedShadowTree(document.body);
        });

        it('element (composed: true)', () => {
            const evt = new CustomEvent('test', { composed: true, bubbles: true });
            nodes.span.dispatchEvent(evt);

            assertEventStateReset(evt);
            expect(evt.target).toBe(nodes['x-nested-shadow-tree']);
        });

        // WebKit bug - https://bugs.webkit.org/show_bug.cgi?id=206374
        // In Safari, the event target is not null.
        xit('element (composed: false)', () => {
            const evt = new CustomEvent('test', { bubbles: true });
            nodes.span.dispatchEvent(evt);

            assertEventStateReset(evt);
            expect(evt.target).toBe(null);
        });

        it('element added via lwc:dom="manual" (composed: true)', () => {
            const evt = new CustomEvent('test', { composed: true, bubbles: true });
            nodes['span-manual'].dispatchEvent(evt);

            expect(evt.target).toBe(nodes['x-nested-shadow-tree']);
            assertEventStateReset(evt);
        });

        // WebKit bug - https://bugs.webkit.org/show_bug.cgi?id=206374
        // In Safari, the event target is not null.
        xit('element added via lwc:dom="manual" (composed: false)', () => {
            const evt = new CustomEvent('test', { bubbles: true });
            nodes['span-manual'].dispatchEvent(evt);

            assertEventStateReset(evt);
            expect(evt.target).toBe(null);
        });

        it('component (composed: true)', () => {
            const evt = new CustomEvent('test', { composed: true, bubbles: true });
            nodes['x-shadow-tree'].dispatchEventComponent(evt);

            assertEventStateReset(evt);
            expect(evt.target).toBe(nodes['x-nested-shadow-tree']);
        });

        // WebKit bug - https://bugs.webkit.org/show_bug.cgi?id=206374
        // In Safari, the event target is not null.
        xit('component (composed: false)', () => {
            const evt = new CustomEvent('test', { bubbles: true });
            nodes['x-shadow-tree'].dispatchEventComponent(evt);

            assertEventStateReset(evt);
            expect(evt.target).toBe(null);
        });
    });
}
