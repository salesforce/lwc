import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';

import LightChild from 'x/lightChild';
import ShadowContainer from 'x/shadowContainer';
import LightContainer from 'x/lightContainer';

function createTestElement(tag, component) {
    const elm = createElement(tag, { is: component });
    elm.setAttribute('data-id', tag);
    document.body.appendChild(elm);
    return extractDataIds(elm);
}

function dispatchEventWithLog(target, nodes, event) {
    const log = [];

    const allNodes = [
        ...Object.values(nodes),
        document.body,
        document.documentElement,
        document,
        window,
    ];
    const listeners = new Map();
    allNodes.forEach((node) => {
        const listener = (event) => {
            log.push([event.currentTarget, event.target, event.composedPath()]);
        };
        node.addEventListener(event.type, listener);
        listeners.set(node, listener);
    });

    target.dispatchEvent(event);

    allNodes.forEach((node) => {
        node.removeEventListener(event.type, listeners.get(node));
        listeners.delete(node);
    });
    return log;
}

describe('single light child', () => {
    let nodes;
    beforeEach(() => {
        nodes = createTestElement('x-light-child', LightChild);
    });

    it('{ bubbles: true, composed: false }', () => {
        const log = dispatchEventWithLog(
            nodes.button,
            nodes,
            new CustomEvent('test', { bubbles: true, composed: false })
        );

        const composedPath = [
            nodes.button,
            nodes['x-light-child'],
            document.body,
            document.documentElement,
            document,
            window,
        ];

        expect(log).toEqual([
            [nodes.button, nodes.button, composedPath],
            [nodes['x-light-child'], nodes.button, composedPath],
            [document.body, nodes.button, composedPath],
            [document.documentElement, nodes.button, composedPath],
            [document, nodes.button, composedPath],
            [window, nodes.button, composedPath],
        ]);
    });

    it('{ bubbles: false, composed: false }', () => {
        const log = dispatchEventWithLog(
            nodes.button,
            nodes,
            new CustomEvent('test', { bubbles: false, composed: false })
        );

        const composedPath = [
            nodes.button,
            nodes['x-light-child'],
            document.body,
            document.documentElement,
            document,
            window,
        ];

        expect(log).toEqual([[nodes.button, nodes.button, composedPath]]);
    });
});

describe('shadow container, light child', () => {
    let nodes;
    beforeEach(() => {
        nodes = createTestElement('x-shadow-container', ShadowContainer);
    });

    it('{ bubbles: true, composed: true }', () => {
        const log = dispatchEventWithLog(
            nodes.button,
            nodes,
            new CustomEvent('test', { bubbles: true, composed: true })
        );

        const composedPath = [
            nodes.button,
            nodes['x-light-child'],
            nodes['x-shadow-container'].shadowRoot,
            nodes['x-shadow-container'],
            document.body,
            document.documentElement,
            document,
            window,
        ];

        expect(log).toEqual([
            [nodes.button, nodes.button, composedPath],
            [nodes['x-light-child'], nodes.button, composedPath],
            [nodes['x-shadow-container'].shadowRoot, nodes.button, composedPath],
            [nodes['x-shadow-container'], nodes['x-shadow-container'], composedPath],
            [document.body, nodes['x-shadow-container'], composedPath],
            [document.documentElement, nodes['x-shadow-container'], composedPath],
            [document, nodes['x-shadow-container'], composedPath],
            [window, nodes['x-shadow-container'], composedPath],
        ]);
    });

    it('{ bubbles: true, composed: false }', () => {
        const log = dispatchEventWithLog(
            nodes.button,
            nodes,
            new CustomEvent('test', { bubbles: true, composed: false })
        );

        const composedPath = [
            nodes.button,
            nodes['x-light-child'],
            nodes['x-shadow-container'].shadowRoot,
        ];

        expect(log).toEqual([
            [nodes.button, nodes.button, composedPath],
            [nodes['x-light-child'], nodes.button, composedPath],
            [nodes['x-shadow-container'].shadowRoot, nodes.button, composedPath],
        ]);
    });
});

describe('light container, shadow child', () => {
    let nodes;
    beforeEach(() => {
        nodes = createTestElement('x-light-container', LightContainer);
    });

    it('{ bubbles: true, composed: true }', () => {
        const log = dispatchEventWithLog(
            nodes.button,
            nodes,
            new CustomEvent('test', { bubbles: true, composed: true })
        );

        const composedPath = [
            nodes.button,
            nodes['x-shadow-child'].shadowRoot,
            nodes['x-shadow-child'],
            nodes['x-light-container'],
            document.body,
            document.documentElement,
            document,
            window,
        ];

        expect(log).toEqual([
            [nodes.button, nodes.button, composedPath],
            [nodes['x-shadow-child'].shadowRoot, nodes.button, composedPath],
            [nodes['x-shadow-child'], nodes['x-shadow-child'], composedPath],
            [nodes['x-light-container'], nodes['x-shadow-child'], composedPath],
            [document.body, nodes['x-shadow-child'], composedPath],
            [document.documentElement, nodes['x-shadow-child'], composedPath],
            [document, nodes['x-shadow-child'], composedPath],
            [window, nodes['x-shadow-child'], composedPath],
        ]);
    });

    it('{ bubbles: true, composed: false }', () => {
        const log = dispatchEventWithLog(
            nodes.button,
            nodes,
            new CustomEvent('test', { bubbles: true, composed: false })
        );

        const composedPath = [nodes.button, nodes['x-shadow-child'].shadowRoot];

        expect(log).toEqual([
            [nodes.button, nodes.button, composedPath],
            [nodes['x-shadow-child'].shadowRoot, nodes.button, composedPath],
        ]);
    });
});
