// Inspired from WPT:
// https://github.com/web-platform-tests/wpt/blob/master/shadow-dom/event-post-dispatch.html

import { createElement, extractDataIds } from 'test-utils';

import ShadowTree from 'x/shadowTree';
import NestedShadowTree from 'x/nestedShadowTree';

function createShadowTree(parentNode) {
    const elm = createElement('x-shadow-tree', { is: ShadowTree });
    elm.setAttribute('data-id', 'x-shadow-tree');
    parentNode.appendChild(elm);

    return extractDataIds(elm);
}

describe('Event properties post dispatch on node in a shadow tree', () => {
    let nodes;
    beforeEach(() => {
        nodes = createShadowTree(document.body);
    });

    // TODO: #1129 - Invoking dispatchEvent on nodes rendered by the template doesn't respect retargetting
    xit('element (composed: true)', () => {
        const evt = new CustomEvent('test', { composed: true, bubbles: true });
        nodes.span.dispatchEvent(evt);

        expect(evt.target).toBe(nodes['x-shadow-tree']);
        expect(evt.eventPhase).toBe(0);
        expect(evt.currentTarget).toBe(null);
        expect(evt.composedPath().length).toBe(0);
    });

    // TODO: #1129 - Invoking dispatchEvent on nodes rendered by the template doesn't respect retargetting
    xit('element (composed: false)', () => {
        const evt = new CustomEvent('test', { bubbles: true });
        nodes.span.dispatchEvent(evt);

        expect(evt.target).toBe(null);
        expect(evt.eventPhase).toBe(0);
        expect(evt.currentTarget).toBe(null);
        expect(evt.composedPath().length).toBe(0);
    });

    // TODO: #1129 - Invoking dispatchEvent on nodes rendered by the template doesn't respect retargetting
    xit('element added via lwc:dom="manual" (composed: true)', () => {
        const evt = new CustomEvent('test', { composed: true, bubbles: true });
        nodes['span-manual'].dispatchEvent(evt);

        expect(evt.target).toBe(nodes['x-shadow-tree']);
        expect(evt.eventPhase).toBe(0);
        expect(evt.currentTarget).toBe(null);
        expect(evt.composedPath().length).toBe(0);
    });

    // TODO: #1129 - Invoking dispatchEvent on nodes rendered by the template doesn't respect retargetting
    xit('element added via lwc:dom="manual" (composed: false)', () => {
        const evt = new CustomEvent('test', { bubbles: true });
        nodes['span-manual'].dispatchEvent(evt);

        expect(evt.target).toBe(null);
        expect(evt.eventPhase).toBe(0);
        expect(evt.currentTarget).toBe(null);
        expect(evt.composedPath().length).toBe(0);
    });

    // TODO: #1131 - SyntheticShadowRoot doesn't patch dispatchEvent
    xit('shadow root (composed: true)', () => {
        const evt = new CustomEvent('test', { composed: true, bubbles: true });
        nodes['x-shadow-tree'].shadowRoot.dispatchEvent(evt);

        expect(evt.target).toBe(nodes['x-shadow-tree']);
        expect(evt.eventPhase).toBe(0);
        expect(evt.currentTarget).toBe(null);
        expect(evt.composedPath().length).toBe(0);
    });

    // TODO: #1131 - SyntheticShadowRoot doesn't patch dispatchEvent
    xit('shadow root (composed: false)', () => {
        const evt = new CustomEvent('test', { bubbles: true });
        nodes['x-shadow-tree'].shadowRoot.dispatchEvent(evt);

        expect(evt.target).toBe(null);
        expect(evt.eventPhase).toBe(0);
        expect(evt.currentTarget).toBe(null);
        expect(evt.composedPath().length).toBe(0);
    });

    // TODO: #1141 - Event non dispatched from within a LWC shadow tree are not patched
    xit('component (composed: true)', () => {
        const evt = new CustomEvent('test', { composed: true, bubbles: true });
        nodes['x-shadow-tree'].dispatchEventComponent(evt);

        expect(evt.target).toBe(nodes['x-shadow-tree']);
        expect(evt.eventPhase).toBe(0);
        expect(evt.currentTarget).toBe(null);
        expect(evt.composedPath().length).toBe(0);
    });

    // TODO: #1141 - Event non dispatched from within a LWC shadow tree are not patched
    xit('component (composed: false)', () => {
        const evt = new CustomEvent('test', { bubbles: true });
        nodes['x-shadow-tree'].dispatchEventComponent(evt);

        expect(evt.target).toBe(nodes['x-shadow-tree']);
        expect(evt.eventPhase).toBe(0);
        expect(evt.currentTarget).toBe(null);
        expect(evt.composedPath().length).toBe(0);
    });
});

function createNestedShadowTree(parentNode) {
    const elm = createElement('x-nested-shadow-tree', { is: NestedShadowTree });
    elm.setAttribute('data-id', 'x-nested-shadow-tree');
    parentNode.appendChild(elm);

    return extractDataIds(elm);
}

describe('Event properties post dispatch on node in a nested shadow tree', () => {
    let nodes;
    beforeEach(() => {
        nodes = createNestedShadowTree(document.body);
    });

    // TODO: #1129 - Invoking dispatchEvent on nodes rendered by the template doesn't respect retargetting
    xit('element (composed: true)', () => {
        const evt = new CustomEvent('test', { composed: true, bubbles: true });
        nodes.span.dispatchEvent(evt);

        expect(evt.target).toBe(nodes['x-nested-shadow-tree']);
        expect(evt.eventPhase).toBe(0);
        expect(evt.currentTarget).toBe(null);
        expect(evt.composedPath().length).toBe(0);
    });

    // TODO: #1129 - Invoking dispatchEvent on nodes rendered by the template doesn't respect retargetting
    xit('element (composed: false)', () => {
        const evt = new CustomEvent('test', { bubbles: true });
        nodes.span.dispatchEvent(evt);

        expect(evt.target).toBe(null);
        expect(evt.eventPhase).toBe(0);
        expect(evt.currentTarget).toBe(null);
        expect(evt.composedPath().length).toBe(0);
    });

    // TODO: #1129 - Invoking dispatchEvent on nodes rendered by the template doesn't respect retargetting
    xit('element added via lwc:dom="manual" (composed: true)', () => {
        const evt = new CustomEvent('test', { composed: true, bubbles: true });
        nodes['span-manual'].dispatchEvent(evt);

        expect(evt.target).toBe(nodes['x-nested-shadow-tree']);
        expect(evt.eventPhase).toBe(0);
        expect(evt.currentTarget).toBe(null);
        expect(evt.composedPath().length).toBe(0);
    });

    // TODO: #1129 - Invoking dispatchEvent on nodes rendered by the template doesn't respect retargetting
    xit('element added via lwc:dom="manual" (composed: false)', () => {
        const evt = new CustomEvent('test', { bubbles: true });
        nodes['span-manual'].dispatchEvent(evt);

        expect(evt.target).toBe(null);
        expect(evt.eventPhase).toBe(0);
        expect(evt.currentTarget).toBe(null);
        expect(evt.composedPath().length).toBe(0);
    });

    // TODO: #1131 - SyntheticShadowRoot doesn't patch dispatchEvent
    xit('shadow root (composed: true)', () => {
        const evt = new CustomEvent('test', { composed: true, bubbles: true });
        nodes['x-shadow-tree'].shadowRoot.dispatchEvent(evt);

        expect(evt.target).toBe(nodes['x-nested-shadow-tree']);
        expect(evt.eventPhase).toBe(0);
        expect(evt.currentTarget).toBe(null);
        expect(evt.composedPath().length).toBe(0);
    });

    // TODO: #1131 - SyntheticShadowRoot doesn't patch dispatchEvent
    xit('shadow root (composed: false)', () => {
        const evt = new CustomEvent('test', { bubbles: true });
        nodes['x-shadow-tree'].shadowRoot.dispatchEvent(evt);

        expect(evt.target).toBe(null);
        expect(evt.eventPhase).toBe(0);
        expect(evt.currentTarget).toBe(null);
        expect(evt.composedPath().length).toBe(0);
    });

    // TODO: #1129 - Invoking dispatchEvent on nodes rendered by the template doesn't respect retargetting
    xit('component (composed: true)', () => {
        const evt = new CustomEvent('test', { composed: true, bubbles: true });
        nodes['x-shadow-tree'].dispatchEventComponent(evt);

        expect(evt.target).toBe(nodes['x-nested-shadow-tree']);
        expect(evt.eventPhase).toBe(0);
        expect(evt.currentTarget).toBe(null);
        expect(evt.composedPath().length).toBe(0);
    });

    // TODO: #1129 - Invoking dispatchEvent on nodes rendered by the template doesn't respect retargetting
    xit('component (composed: false)', () => {
        const evt = new CustomEvent('test', { bubbles: true });
        nodes['x-shadow-tree'].dispatchEventComponent(evt);

        expect(evt.target).toBe(nodes['x-nested-shadow-tree']);
        expect(evt.eventPhase).toBe(0);
        expect(evt.currentTarget).toBe(null);
        expect(evt.composedPath().length).toBe(0);
    });
});
