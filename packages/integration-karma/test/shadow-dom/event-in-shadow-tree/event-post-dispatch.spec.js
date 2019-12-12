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

describe('Event properties post dispatch on node in a shadow tree', () => {
    let nodes;
    beforeAll(() => {
        nodes = createShadowTree(document.body);
    });

    // TODO [#1129]: Invoking dispatchEvent on nodes rendered by the template doesn't respect retargetting
    xit('element (composed: true)', () => {
        const evt = new CustomEvent('test', { composed: true, bubbles: true });
        nodes.span.dispatchEvent(evt);

        assertEventStateReset(evt);
        expect(evt.target).toBe(nodes['x-shadow-tree']);
    });

    // TODO [#1129]: Invoking dispatchEvent on nodes rendered by the template doesn't respect retargetting
    xit('element (composed: false)', () => {
        const evt = new CustomEvent('test', { bubbles: true });
        nodes.span.dispatchEvent(evt);

        assertEventStateReset(evt);
        expect(evt.target).toBe(null);
    });

    // TODO [#1129]: Invoking dispatchEvent on nodes rendered by the template doesn't respect retargetting
    xit('element added via lwc:dom="manual" (composed: true)', () => {
        const evt = new CustomEvent('test', { composed: true, bubbles: true });
        nodes['span-manual'].dispatchEvent(evt);

        assertEventStateReset(evt);
        expect(evt.target).toBe(nodes['x-shadow-tree']);
    });

    // TODO [#1129]: Invoking dispatchEvent on nodes rendered by the template doesn't respect retargetting
    xit('element added via lwc:dom="manual" (composed: false)', () => {
        const evt = new CustomEvent('test', { bubbles: true });
        nodes['span-manual'].dispatchEvent(evt);

        assertEventStateReset(evt);
        expect(evt.target).toBe(null);
    });

    // TODO [#1129]: Invoking dispatchEvent on nodes rendered by the template doesn't respect retargetting
    xit('component (composed: true)', () => {
        const evt = new CustomEvent('test', { composed: true, bubbles: true });
        nodes['x-shadow-tree'].dispatchEventComponent(evt);

        expect(evt.target).toBe(nodes['x-shadow-tree']);
        assertEventStateReset(evt);
    });

    // TODO [#1129]: Invoking dispatchEvent on nodes rendered by the template doesn't respect retargetting
    xit('component (composed: false)', () => {
        const evt = new CustomEvent('test', { bubbles: true });
        nodes['x-shadow-tree'].dispatchEventComponent(evt);

        assertEventStateReset(evt);
        expect(evt.target).toBe(nodes['x-shadow-tree']);
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
    beforeAll(() => {
        nodes = createNestedShadowTree(document.body);
    });

    // TODO [#1129]: Invoking dispatchEvent on nodes rendered by the template doesn't respect retargetting
    xit('element (composed: true)', () => {
        const evt = new CustomEvent('test', { composed: true, bubbles: true });
        nodes.span.dispatchEvent(evt);

        assertEventStateReset(evt);
        expect(evt.target).toBe(nodes['x-nested-shadow-tree']);
    });

    // TODO [#1129]: Invoking dispatchEvent on nodes rendered by the template doesn't respect retargetting
    xit('element (composed: false)', () => {
        const evt = new CustomEvent('test', { bubbles: true });
        nodes.span.dispatchEvent(evt);

        assertEventStateReset(evt);
        expect(evt.target).toBe(null);
    });

    // TODO [#1129]: Invoking dispatchEvent on nodes rendered by the template doesn't respect retargetting
    xit('element added via lwc:dom="manual" (composed: true)', () => {
        const evt = new CustomEvent('test', { composed: true, bubbles: true });
        nodes['span-manual'].dispatchEvent(evt);

        expect(evt.target).toBe(nodes['x-nested-shadow-tree']);
        assertEventStateReset(evt);
    });

    // TODO [#1129]: Invoking dispatchEvent on nodes rendered by the template doesn't respect retargetting
    xit('element added via lwc:dom="manual" (composed: false)', () => {
        const evt = new CustomEvent('test', { bubbles: true });
        nodes['span-manual'].dispatchEvent(evt);

        assertEventStateReset(evt);
        expect(evt.target).toBe(null);
    });

    // TODO [#1129]: Invoking dispatchEvent on nodes rendered by the template doesn't respect retargetting
    xit('component (composed: true)', () => {
        const evt = new CustomEvent('test', { composed: true, bubbles: true });
        nodes['x-shadow-tree'].dispatchEventComponent(evt);

        expect(evt.target).toBe(nodes['x-nested-shadow-tree']);
        assertEventStateReset(evt);
    });

    // TODO [#1129]: Invoking dispatchEvent on nodes rendered by the template doesn't respect retargetting
    xit('component (composed: false)', () => {
        const evt = new CustomEvent('test', { bubbles: true });
        nodes['x-shadow-tree'].dispatchEventComponent(evt);

        assertEventStateReset(evt);
        expect(evt.target).toBe(nodes['x-nested-shadow-tree']);
    });
});
