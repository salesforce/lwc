// Inspired from WPT:
// https://github.com/web-platform-tests/wpt/blob/master/shadow-dom/event-composed.html

import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';

import ShadowTree from 'x/shadowTree';

const EVENT_MAPPING = [
    ['Event', Event],
    ['CustomEvent', CustomEvent],
];

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

function testEventScopeInShadowTree(type, Ctor) {
    describe(`event scope in shadow tree ${type}`, () => {
        let nodes;
        beforeEach(() => {
            nodes = createShadowTree(document.body);
        });

        it('default', () => {
            const evt = new Ctor('test');
            const logs = dispatchEventWithLog(nodes.span, evt);
            const composedPath = [nodes.span, nodes.div, nodes['x-shadow-tree'].shadowRoot];
            expect(logs).toEqual([[nodes.span, nodes.span, composedPath]]);
        });

        // TODO [#960]: Non composed events leaks out of the shadow tree
        xit('{ bubble: true }', () => {
            const evt = new Ctor('test', { bubbles: true });
            const logs = dispatchEventWithLog(nodes.span, evt);

            const composedPath = [nodes.span, nodes.div, nodes['x-shadow-tree'].shadowRoot];
            expect(logs).toEqual([
                [nodes.span, nodes.span, composedPath],
                [nodes.div, nodes.span, composedPath],
                [nodes['x-shadow-tree'].shadowRoot, nodes.span, composedPath],
            ]);
        });

        // TODO [#1138]: Composed and non-bubbling events doesn't invoke host event listeners
        xit('{ composed: true }', () => {
            const evt = new Ctor('test', { composed: true });
            const logs = dispatchEventWithLog(nodes.span, evt);

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
                [nodes['x-shadow-tree'], nodes['x-shadow-tree'], composedPath],
            ]);
        });

        // TODO [#1139]: Event constructor doesn't support composed in compat mode
        xit('{ bubble: true, composed: true }', () => {
            const evt = new Ctor('test', { bubbles: true, composed: true });

            const logs = dispatchEventWithLog(nodes.span, evt);
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
    });
}

function testEventScopeOnHostElement(type, Ctor) {
    describe(`event scope on host element ${type}`, () => {
        let nodes;
        beforeEach(() => {
            nodes = createShadowTree(document.body);
        });

        it('default', () => {
            const evt = new Ctor('test');
            const logs = dispatchEventWithLog(nodes['x-shadow-tree'], evt);

            const composedPath = [
                nodes['x-shadow-tree'],
                document.body,
                document.documentElement,
                document,
                window,
            ];
            expect(logs).toEqual([[nodes['x-shadow-tree'], nodes['x-shadow-tree'], composedPath]]);
        });

        it('{ bubble: true }', () => {
            const evt = new Ctor('test', { bubbles: true });
            const logs = dispatchEventWithLog(nodes['x-shadow-tree'], evt);

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

        it('{ composed: true }', () => {
            const evt = new Ctor('test', { composed: true });
            const logs = dispatchEventWithLog(nodes['x-shadow-tree'], evt);

            const composedPath = [
                nodes['x-shadow-tree'],
                document.body,
                document.documentElement,
                document,
                window,
            ];
            expect(logs).toEqual([[nodes['x-shadow-tree'], nodes['x-shadow-tree'], composedPath]]);
        });

        it('{ bubble: true, composed: true }', () => {
            const evt = new Ctor('test', { bubbles: true, composed: true });

            const logs = dispatchEventWithLog(nodes['x-shadow-tree'], evt);
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
}

for (const [name, Ctor] of EVENT_MAPPING) {
    testEventScopeInShadowTree(name, Ctor);
    testEventScopeOnHostElement(name, Ctor);
}
