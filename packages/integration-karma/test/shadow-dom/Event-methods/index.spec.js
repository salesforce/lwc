import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';

import Container from 'x/container';

function dispatchEventWithLog(target, nodes, event) {
    const log = [];
    [...Object.values(nodes), document.body, document.documentElement, document, window].forEach(
        (node) => {
            node.addEventListener(event.type, () => {
                log.push(node);
            });
        }
    );
    target.dispatchEvent(event);
    return log;
}

function createTestElement() {
    const elm = createElement('x-container', { is: Container });
    elm.setAttribute('data-id', 'x-container');
    document.body.appendChild(elm);
    return extractDataIds(elm);
}

describe('Event.stopPropagation', () => {
    it('native element', () => {
        const nodes = createTestElement();
        const event = new CustomEvent('test', { bubbles: true, composed: true });

        nodes.container_div.addEventListener('test', (event) => {
            event.stopPropagation();
        });

        const logs = dispatchEventWithLog(nodes.child_div, nodes, event);
        expect(logs).toEqual([
            nodes.child_div,
            nodes['x-child.shadowRoot'],
            nodes['x-child'],
            nodes.container_div,
        ]);
    });

    it('shadow root', () => {
        const nodes = createTestElement();
        const event = new CustomEvent('test', { bubbles: true, composed: true });

        nodes['x-container.shadowRoot'].addEventListener('test', (event) => {
            event.stopPropagation();
        });

        const logs = dispatchEventWithLog(nodes.child_div, nodes, event);
        expect(logs).toEqual([
            nodes.child_div,
            nodes['x-child.shadowRoot'],
            nodes['x-child'],
            nodes.container_div,
            nodes['x-container.shadowRoot'],
        ]);
    });

    it('host element', () => {
        const nodes = createTestElement();
        const event = new CustomEvent('test', { bubbles: true, composed: true });

        nodes['x-container'].addEventListener('test', (event) => {
            event.stopPropagation();
        });

        const logs = dispatchEventWithLog(nodes.child_div, nodes, event);
        expect(logs).toEqual([
            nodes.child_div,
            nodes['x-child.shadowRoot'],
            nodes['x-child'],
            nodes.container_div,
            nodes['x-container.shadowRoot'],
            nodes['x-container'],
        ]);
    });
});

describe('Event.stopImmediatePropagation', () => {
    it('native element', () => {
        const nodes = createTestElement();
        const event = new CustomEvent('test', { bubbles: true, composed: true });

        nodes.container_div.addEventListener('test', (event) => {
            event.stopImmediatePropagation();
        });

        const logs = dispatchEventWithLog(nodes.child_div, nodes, event);
        expect(logs).toEqual([nodes.child_div, nodes['x-child.shadowRoot'], nodes['x-child']]);
    });

    it('shadow root', () => {
        const nodes = createTestElement();
        const event = new CustomEvent('test', { bubbles: true, composed: true });

        nodes['x-container.shadowRoot'].addEventListener('test', (event) => {
            event.stopImmediatePropagation();
        });

        const logs = dispatchEventWithLog(nodes.child_div, nodes, event);
        expect(logs).toEqual([
            nodes.child_div,
            nodes['x-child.shadowRoot'],
            nodes['x-child'],
            nodes.container_div,
        ]);
    });

    it('host element', () => {
        const nodes = createTestElement();
        const event = new CustomEvent('test', { bubbles: true, composed: true });

        nodes['x-container'].addEventListener('test', (event) => {
            event.stopImmediatePropagation();
        });

        const logs = dispatchEventWithLog(nodes.child_div, nodes, event);
        expect(logs).toEqual([
            nodes.child_div,
            nodes['x-child.shadowRoot'],
            nodes['x-child'],
            nodes.container_div,
            nodes['x-container.shadowRoot'],
        ]);
    });
});
