import { createElement, setFeatureFlagForTest } from 'lwc';
import { extractDataIds } from 'test-utils';

import LightElement from 'x/light';

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

describe('root light element', () => {
    afterEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_GET_ROOT_NODE_PATCH', false);
    });
    if (!process.env.NATIVE_SHADOW) {
        it('should not dispatch events to window from elements slotted into synthetic shadow', () => {
            const nodes = createTestElement('x-root', LightElement);

            const log = dispatchEventWithLog(
                nodes.button,
                nodes,
                new CustomEvent('test', { bubbles: true, composed: false })
            );

            const composedPath = [nodes.button, nodes.slot, nodes['x-list'].shadowRoot];
            expect(log).toEqual([
                [nodes.button, nodes.button, composedPath],
                [nodes.slot, nodes.button, composedPath],
                [nodes['x-list'].shadowRoot, nodes.button, composedPath],
            ]);
        });
    }
    it('should throw events properly with flag ENABLE_LIGHT_GET_ROOT_NODE_PATCH', () => {
        setFeatureFlagForTest('ENABLE_LIGHT_GET_ROOT_NODE_PATCH', true);
        const nodes = createTestElement('x-root', LightElement);

        const log = dispatchEventWithLog(
            nodes.button,
            nodes,
            new CustomEvent('test', { bubbles: true, composed: false })
        );

        const composedPath = [
            nodes.button,
            nodes.slot,
            nodes['x-list'].shadowRoot,
            nodes['x-list'],
            nodes['x-root'],
            document.body,
            document.documentElement,
            document,
            window,
        ];
        expect(log).toEqual([
            [nodes.button, nodes.button, composedPath],
            [nodes.slot, nodes.button, composedPath],
            [nodes['x-list'].shadowRoot, nodes.button, composedPath],
            [nodes['x-list'], nodes.button, composedPath],
            [nodes['x-root'], nodes.button, composedPath],
            [document.body, nodes.button, composedPath],
            [document.documentElement, nodes.button, composedPath],
            [document, nodes.button, composedPath],
            [window, nodes.button, composedPath],
        ]);
    });
});
