// Inspired from WPT:
// https://github.com/web-platform-tests/wpt/blob/master/shadow-dom/event-inside-shadow-tree.html

import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';

import ShadowTree from 'x/shadowTree';
import NestedShadowTree from 'x/nestedShadowTree';
import XParentWithDeclarativeHandlers from 'x/parentWithDeclarativeHandlers';

function dispatchEventWithLog(target, event) {
    var log = [];

    for (var node = target; node; node = node.parentNode || node.host) {
        node.addEventListener(
            event.type,
            function (event) {
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

    it('propagate event from a child element added via lwc:dom="manual"', () => {
        // Fire the event in next macrotask to allow time for the MO to key the manually inserted nodes
        return new Promise((resolve) => {
            setTimeout(resolve);
        }).then(() => {
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
    });

    it('propagate event from a host element', () => {
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

    describe('parent with declarative handlers', () => {
        let elm;
        let child;
        beforeAll(() => {
            elm = createElement('x-parent-with-declarative-handlers', {
                is: XParentWithDeclarativeHandlers,
            });
            document.body.appendChild(elm);
            child = elm.shadowRoot.querySelector('x-event-dispatching-child');
        });
        if (process.env.COMPAT !== true) {
            // https://github.com/salesforce/es5-proxy-compat/issues/115
            it('event handlers gets invoked when composed event is dispatched', () => {
                child.dispatchStandardEvent();
                expect(elm.eventReceived).toBe(true);
            });
        }

        it('event handlers gets invoked when composed custom event is dispatched', () => {
            child.dispatchCustomEvent();
            expect(elm.customEventReceived).toBe(true);
        });
    });
});

/**
 * Check to detect if, in a disconnected tree, events bubble to the documentFragment
 */
function doEventsBubbleToDocFrag() {
    const frag = document.createDocumentFragment();
    const div = document.createElement('div');
    frag.appendChild(div);
    let ret = false;
    frag.addEventListener('test', () => {
        ret = true;
    });
    div.dispatchEvent(new CustomEvent('test', { composed: true, bubbles: true }));
    return ret;
}

describe('event propagation in disconnected tree', () => {
    it('propagate event from a child element in a document fragment', () => {
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
        if (doEventsBubbleToDocFrag()) {
            expect(logs).toEqual([
                [nodes.span, nodes.span, composedPath],
                [nodes.div, nodes.span, composedPath],
                [nodes['x-shadow-tree'].shadowRoot, nodes.span, composedPath],
                [nodes['x-shadow-tree'], nodes['x-shadow-tree'], composedPath],
                [fragment, nodes['x-shadow-tree'], composedPath],
            ]);
        } else {
            // IE11
            expect(logs).toEqual([
                [nodes.span, nodes.span, composedPath],
                [nodes.div, nodes.span, composedPath],
                [nodes['x-shadow-tree'].shadowRoot, nodes.span, composedPath],
                [nodes['x-shadow-tree'], nodes['x-shadow-tree'], composedPath],
            ]);
        }
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

    it('propagate event from a child element added via lwc:dom="manual"', () => {
        // Fire the event in next macrotask to allow time for the MO to key the manually inserted nodes
        return new Promise((resolve) => {
            setTimeout(resolve);
        }).then(() => {
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
