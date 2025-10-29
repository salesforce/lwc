import { createElement } from 'lwc';

import LightChild from 'c/lightChild';
import ShadowContainer from 'c/shadowContainer';
import LightContainer from 'c/lightContainer';
import { extractDataIds } from '../../../helpers/utils.js';

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
        nodes = createTestElement('c-light-child', LightChild);
    });

    it('{ bubbles: true, composed: false }', () => {
        const log = dispatchEventWithLog(
            nodes.button,
            nodes,
            new CustomEvent('test', { bubbles: true, composed: false })
        );

        const composedPath = [
            nodes.button,
            nodes['c-light-child'],
            document.body,
            document.documentElement,
            document,
            window,
        ];

        expect(log).toEqual([
            [nodes.button, nodes.button, composedPath],
            [nodes['c-light-child'], nodes.button, composedPath],
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
            nodes['c-light-child'],
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
        nodes = createTestElement('c-shadow-container', ShadowContainer);
    });

    it('{ bubbles: true, composed: true }', () => {
        const log = dispatchEventWithLog(
            nodes.button,
            nodes,
            new CustomEvent('test', { bubbles: true, composed: true })
        );

        const composedPath = [
            nodes.button,
            nodes['c-light-child'],
            nodes['c-shadow-container'].shadowRoot,
            nodes['c-shadow-container'],
            document.body,
            document.documentElement,
            document,
            window,
        ];

        expect(log).toEqual([
            [nodes.button, nodes.button, composedPath],
            [nodes['c-light-child'], nodes.button, composedPath],
            [nodes['c-shadow-container'].shadowRoot, nodes.button, composedPath],
            [nodes['c-shadow-container'], nodes['c-shadow-container'], composedPath],
            [document.body, nodes['c-shadow-container'], composedPath],
            [document.documentElement, nodes['c-shadow-container'], composedPath],
            [document, nodes['c-shadow-container'], composedPath],
            [window, nodes['c-shadow-container'], composedPath],
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
            nodes['c-light-child'],
            nodes['c-shadow-container'].shadowRoot,
        ];

        expect(log).toEqual([
            [nodes.button, nodes.button, composedPath],
            [nodes['c-light-child'], nodes.button, composedPath],
            [nodes['c-shadow-container'].shadowRoot, nodes.button, composedPath],
        ]);
    });
});

describe('light container, shadow child', () => {
    let nodes;
    beforeEach(() => {
        nodes = createTestElement('c-light-container', LightContainer);
    });

    it('{ bubbles: true, composed: true }', () => {
        const log = dispatchEventWithLog(
            nodes.button,
            nodes,
            new CustomEvent('test', { bubbles: true, composed: true })
        );

        const composedPath = [
            nodes.button,
            nodes['c-shadow-child'].shadowRoot,
            nodes['c-shadow-child'],
            nodes['c-light-container'],
            document.body,
            document.documentElement,
            document,
            window,
        ];

        expect(log).toEqual([
            [nodes.button, nodes.button, composedPath],
            [nodes['c-shadow-child'].shadowRoot, nodes.button, composedPath],
            [nodes['c-shadow-child'], nodes['c-shadow-child'], composedPath],
            [nodes['c-light-container'], nodes['c-shadow-child'], composedPath],
            [document.body, nodes['c-shadow-child'], composedPath],
            [document.documentElement, nodes['c-shadow-child'], composedPath],
            [document, nodes['c-shadow-child'], composedPath],
            [window, nodes['c-shadow-child'], composedPath],
        ]);
    });

    it('{ bubbles: true, composed: false }', () => {
        const log = dispatchEventWithLog(
            nodes.button,
            nodes,
            new CustomEvent('test', { bubbles: true, composed: false })
        );

        const composedPath = [nodes.button, nodes['c-shadow-child'].shadowRoot];

        expect(log).toEqual([
            [nodes.button, nodes.button, composedPath],
            [nodes['c-shadow-child'].shadowRoot, nodes.button, composedPath],
        ]);
    });
});
