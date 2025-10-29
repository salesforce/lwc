import { createElement } from 'lwc';
import LightElement from 'c/light';
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

describe('root light element', () => {
    it('should throw events properly', () => {
        const nodes = createTestElement('c-root', LightElement);

        const log = dispatchEventWithLog(
            nodes.button,
            nodes,
            new CustomEvent('test', { bubbles: true, composed: false })
        );

        const composedPath = [
            nodes.button,
            nodes.slot,
            nodes['c-list'].shadowRoot,
            nodes['c-list'],
            nodes['c-root'],
            document.body,
            document.documentElement,
            document,
            window,
        ];
        expect(log).toEqual([
            [nodes.button, nodes.button, composedPath],
            [nodes.slot, nodes.button, composedPath],
            [nodes['c-list'].shadowRoot, nodes.button, composedPath],
            [nodes['c-list'], nodes.button, composedPath],
            [nodes['c-root'], nodes.button, composedPath],
            [document.body, nodes.button, composedPath],
            [document.documentElement, nodes.button, composedPath],
            [document, nodes.button, composedPath],
            [window, nodes.button, composedPath],
        ]);
    });

    it('querySelector should return slotted elements', () => {
        const nodes = createTestElement('c-root', LightElement);
        expect(nodes['c-list'].querySelectorAll('button')[0]).toEqual(nodes.button);
        expect(nodes['c-list'].querySelector('button')).toEqual(nodes.button);
        expect(nodes['c-list'].getElementsByTagName('button')[0]).toEqual(nodes.button);
        expect(nodes['c-list'].getElementsByClassName('button')[0]).toEqual(nodes.button);
        expect(nodes['c-list'].childNodes[0]).toEqual(nodes.button);
        expect(nodes['c-list'].children[0]).toEqual(nodes.button);
    });
});
