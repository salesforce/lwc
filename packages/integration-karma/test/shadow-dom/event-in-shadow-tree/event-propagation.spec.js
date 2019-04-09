// Inspired from WPT:
// https://github.com/web-platform-tests/wpt/blob/master/shadow-dom/event-inside-shadow-tree.html

import { createElement, extractDataIds } from 'test-utils';

import ShadowTree from 'x/shadowTree';
import NestedShadowTree from 'x/nestedShadowTree';

function dispatchEventWithLog(target, event) {
    var log = [];

    for (var node = target; node; node = node.parentNode || node.host) {
        node.addEventListener(
            event.type,
            function(event) {
                log.push([this, event.target, event.composedPath()]);
            }.bind(node)
        );
    }

    target.dispatchEvent(event);
    return log;
}

function createShadowTree(parentNode) {
    const elm = createElement('x-shadow-tree', { is: ShadowTree });
    elm.setAttribute('data-id', 'x-shadow-tree');
    parentNode.appendChild(elm);

    return extractDataIds(elm);
}

describe('event propagation in simple shadow tree', () => {
    let nodes;
    beforeEach(() => {
        nodes = createShadowTree(document.body);
    });

    it('propagate event from a child element', () => {
        const logs = dispatchEventWithLog(
            nodes.span,
            new CustomEvent('test', { composed: true, bubbles: true })
        );

        const composedPath = [
            nodes.span,
            nodes.div,
            nodes['x-shadow-tree'].shadowRoot,
            nodes['x-shadow-tree'],
            document.body,
            document.documentElement,
            document,
            window,
        ];
        expect(logs).toEqual([
            [nodes.span, nodes.span, composedPath],
            [nodes.div, nodes.span, composedPath],
            [nodes['x-shadow-tree'].shadowRoot, nodes.span, composedPath],
            [nodes['x-shadow-tree'], nodes['x-shadow-tree'], composedPath],
            [document.body, nodes['x-shadow-tree'], composedPath],
            [document.documentElement, nodes['x-shadow-tree'], composedPath],
            [document, nodes['x-shadow-tree'], composedPath],
        ]);
    });

    // TODO: #1132 - Event.prototype.composedPath() doesn't return the shadow root
    xit('propagate event from a child element added via lwc:dom="manual"', () => {
        const logs = dispatchEventWithLog(
            nodes['span-manual'],
            new CustomEvent('test', { composed: true, bubbles: true })
        );

        const composedPath = [
            nodes['span-manual'],
            nodes['div-manual'],
            nodes['x-shadow-tree'].shadowRoot,
            nodes['x-shadow-tree'],
            document.body,
            document.documentElement,
            document,
            window,
        ];
        expect(logs).toEqual([
            [nodes['span-manual'], nodes['span-manual'], composedPath],
            [nodes['div-manual'], nodes['span-manual'], composedPath],
            [nodes['x-shadow-tree'].shadowRoot, nodes['span-manual'], composedPath],
            [nodes['x-shadow-tree'], nodes['x-shadow-tree'], composedPath],
            [document.body, nodes['x-shadow-tree'], composedPath],
            [document.documentElement, nodes['x-shadow-tree'], composedPath],
            [document, nodes['x-shadow-tree'], composedPath],
        ]);
    });

    // TODO: #1132 - Event.prototype.composedPath() doesn't return the shadow root
    xit('propagate event from a child element in a document fragment', () => {
        const fragment = document.createDocumentFragment();
        const nodes = createShadowTree(fragment);

        const logs = dispatchEventWithLog(
            nodes.span,
            new CustomEvent('test', { composed: true, bubbles: true })
        );

        const composedPath = [
            nodes.span,
            nodes.div,
            nodes['x-shadow-tree'].shadowRoot,
            nodes['x-shadow-tree'],
            fragment,
        ];
        expect(logs).toEqual([
            [nodes.span, nodes.span, composedPath],
            [nodes.div, nodes.span, composedPath],
            [nodes['x-shadow-tree'].shadowRoot, nodes.span, composedPath],
            [nodes['x-shadow-tree'], nodes['x-shadow-tree'], composedPath],
            [fragment, nodes['x-shadow-tree'], composedPath],
        ]);
    });

    // TODO: #1131 - SyntheticShadowRoot doesn't patch dispatchEvent
    xit('propagate event from a shadow root', () => {
        const logs = dispatchEventWithLog(
            nodes['x-shadow-tree'].shadowRoot,
            new CustomEvent('test', { composed: true, bubbles: true })
        );

        const composedPath = [
            nodes['x-shadow-tree'].shadowRoot,
            nodes['x-shadow-tree'],
            document.body,
            document.documentElement,
            document,
            window,
        ];
        expect(logs).toEqual([
            [nodes['x-shadow-tree'].shadowRoot, nodes['x-shadow-tree'].shadowRoot, composedPath],
            [nodes['x-shadow-tree'], nodes['x-shadow-tree'], composedPath],
            [document.body, nodes['x-shadow-tree'], composedPath],
            [document.documentElement, nodes['x-shadow-tree'], composedPath],
            [document, nodes['x-shadow-tree'], composedPath],
        ]);
    });

    // TODO: #1141 - Event non dispatched from within a LWC shadow tree are not patched
    xit('propagate event from a host element', () => {
        const logs = dispatchEventWithLog(
            nodes['x-shadow-tree'],
            new CustomEvent('test', { composed: true, bubbles: true })
        );

        const composedPath = [
            nodes['x-shadow-tree'],
            document.body,
            document.documentElement,
            document,
            window,
        ];
        expect(logs).toEqual([
            [nodes['x-shadow-tree'], nodes['x-shadow-tree'], composedPath],
            [document.body, nodes['x-shadow-tree'], composedPath],
            [document.documentElement, nodes['x-shadow-tree'], composedPath],
            [document, nodes['x-shadow-tree'], composedPath],
        ]);
    });
});

function createNestedShadowTree(parentNode) {
    const elm = createElement('x-nested-shadow-tree', { is: NestedShadowTree });
    elm.setAttribute('data-id', 'x-nested-shadow-tree');
    parentNode.appendChild(elm);

    return extractDataIds(elm);
}

describe('event propagation in nested shadow tree', () => {
    let nodes;
    beforeEach(() => {
        nodes = createNestedShadowTree(document.body);
    });

    it('propagate event from a child element', () => {
        const logs = dispatchEventWithLog(
            nodes.span,
            new CustomEvent('test', { composed: true, bubbles: true })
        );

        const composedPath = [
            nodes.span,
            nodes.div,
            nodes['x-shadow-tree'].shadowRoot,
            nodes['x-shadow-tree'],
            nodes['x-nested-shadow-tree'].shadowRoot,
            nodes['x-nested-shadow-tree'],
            document.body,
            document.documentElement,
            document,
            window,
        ];
        expect(logs).toEqual([
            [nodes.span, nodes.span, composedPath],
            [nodes.div, nodes.span, composedPath],
            [nodes['x-shadow-tree'].shadowRoot, nodes.span, composedPath],
            [nodes['x-shadow-tree'], nodes['x-shadow-tree'], composedPath],
            [nodes['x-nested-shadow-tree'].shadowRoot, nodes['x-shadow-tree'], composedPath],
            [nodes['x-nested-shadow-tree'], nodes['x-nested-shadow-tree'], composedPath],
            [document.body, nodes['x-nested-shadow-tree'], composedPath],
            [document.documentElement, nodes['x-nested-shadow-tree'], composedPath],
            [document, nodes['x-nested-shadow-tree'], composedPath],
        ]);
    });

    // TODO: #1132 - Event.prototype.composedPath() doesn't return the shadow root
    xit('propagate event from a child element added via lwc:dom="manual"', () => {
        const logs = dispatchEventWithLog(
            nodes['span-manual'],
            new CustomEvent('test', { composed: true, bubbles: true })
        );

        const composedPath = [
            nodes['span-manual'],
            nodes['div-manual'],
            nodes['x-shadow-tree'].shadowRoot,
            nodes['x-shadow-tree'],
            nodes['x-nested-shadow-tree'].shadowRoot,
            nodes['x-nested-shadow-tree'],
            document.body,
            document.documentElement,
            document,
            window,
        ];
        expect(logs).toEqual([
            [nodes['span-manual'], nodes['span-manual'], composedPath],
            [nodes['div-manual'], nodes['span-manual'], composedPath],
            [nodes['x-shadow-tree'].shadowRoot, nodes['span-manual'], composedPath],
            [nodes['x-shadow-tree'], nodes['x-shadow-tree'], composedPath],
            [nodes['x-nested-shadow-tree'].shadowRoot, nodes['x-shadow-tree'], composedPath],
            [nodes['x-nested-shadow-tree'], nodes['x-nested-shadow-tree'], composedPath],
            [document.body, nodes['x-nested-shadow-tree'], composedPath],
            [document.documentElement, nodes['x-nested-shadow-tree'], composedPath],
            [document, nodes['x-nested-shadow-tree'], composedPath],
        ]);
    });

    // TODO: #1131 - SyntheticShadowRoot doesn't patch dispatchEvent
    xit('propagate event from a inner shadow root', () => {
        const logs = dispatchEventWithLog(
            nodes['x-shadow-tree'].shadowRoot,
            new CustomEvent('test', { composed: true, bubbles: true })
        );

        const composedPath = [
            nodes['x-shadow-tree'].shadowRoot,
            nodes['x-shadow-tree'],
            nodes['x-nested-shadow-tree'].shadowRoot,
            nodes['x-nested-shadow-tree'],
            document.body,
            document.documentElement,
            document,
            window,
        ];
        expect(logs).toEqual([
            [nodes['x-shadow-tree'].shadowRoot, nodes['x-shadow-tree'].shadowRoot, composedPath],
            [nodes['x-shadow-tree'], nodes['x-shadow-tree'], composedPath],
            [nodes['x-nested-shadow-tree'].shadowRoot, nodes['x-shadow-tree'], composedPath],
            [nodes['x-nested-shadow-tree'], nodes['x-nested-shadow-tree'], composedPath],
            [document.body, nodes['x-nested-shadow-tree'], composedPath],
            [document.documentElement, nodes['x-nested-shadow-tree'], composedPath],
            [document, nodes['x-nested-shadow-tree'], composedPath],
        ]);
    });

    it('propagate event from a inner host', () => {
        const logs = dispatchEventWithLog(
            nodes['x-shadow-tree'],
            new CustomEvent('test', { composed: true, bubbles: true })
        );

        const composedPath = [
            nodes['x-shadow-tree'],
            nodes['x-nested-shadow-tree'].shadowRoot,
            nodes['x-nested-shadow-tree'],
            document.body,
            document.documentElement,
            document,
            window,
        ];
        expect(logs).toEqual([
            [nodes['x-shadow-tree'], nodes['x-shadow-tree'], composedPath],
            [nodes['x-nested-shadow-tree'].shadowRoot, nodes['x-shadow-tree'], composedPath],
            [nodes['x-nested-shadow-tree'], nodes['x-nested-shadow-tree'], composedPath],
            [document.body, nodes['x-nested-shadow-tree'], composedPath],
            [document.documentElement, nodes['x-nested-shadow-tree'], composedPath],
            [document, nodes['x-nested-shadow-tree'], composedPath],
        ]);
    });
});
