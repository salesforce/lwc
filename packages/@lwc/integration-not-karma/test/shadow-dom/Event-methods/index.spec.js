import { createElement } from 'lwc';
import Container from 'c/container';
import { extractDataIds } from '../../../helpers/utils.js';

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
    const elm = createElement('c-container', { is: Container });
    elm.setAttribute('data-id', 'c-container');
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
            nodes['c-child.shadowRoot'],
            nodes['c-child'],
            nodes.container_div,
        ]);
    });

    it('shadow root', () => {
        const nodes = createTestElement();
        const event = new CustomEvent('test', { bubbles: true, composed: true });

        nodes['c-container.shadowRoot'].addEventListener('test', (event) => {
            event.stopPropagation();
        });

        const logs = dispatchEventWithLog(nodes.child_div, nodes, event);
        expect(logs).toEqual([
            nodes.child_div,
            nodes['c-child.shadowRoot'],
            nodes['c-child'],
            nodes.container_div,
            nodes['c-container.shadowRoot'],
        ]);
    });

    it('host element', () => {
        const nodes = createTestElement();
        const event = new CustomEvent('test', { bubbles: true, composed: true });

        nodes['c-container'].addEventListener('test', (event) => {
            event.stopPropagation();
        });

        const logs = dispatchEventWithLog(nodes.child_div, nodes, event);
        expect(logs).toEqual([
            nodes.child_div,
            nodes['c-child.shadowRoot'],
            nodes['c-child'],
            nodes.container_div,
            nodes['c-container.shadowRoot'],
            nodes['c-container'],
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
        expect(logs).toEqual([nodes.child_div, nodes['c-child.shadowRoot'], nodes['c-child']]);
    });

    it('shadow root', () => {
        const nodes = createTestElement();
        const event = new CustomEvent('test', { bubbles: true, composed: true });

        nodes['c-container.shadowRoot'].addEventListener('test', (event) => {
            event.stopImmediatePropagation();
        });

        const logs = dispatchEventWithLog(nodes.child_div, nodes, event);
        expect(logs).toEqual([
            nodes.child_div,
            nodes['c-child.shadowRoot'],
            nodes['c-child'],
            nodes.container_div,
        ]);
    });

    it('host element', () => {
        const nodes = createTestElement();
        const event = new CustomEvent('test', { bubbles: true, composed: true });

        nodes['c-container'].addEventListener('test', (event) => {
            event.stopImmediatePropagation();
        });

        const logs = dispatchEventWithLog(nodes.child_div, nodes, event);
        expect(logs).toEqual([
            nodes.child_div,
            nodes['c-child.shadowRoot'],
            nodes['c-child'],
            nodes.container_div,
            nodes['c-container.shadowRoot'],
        ]);
    });
});

describe('Event.composedPath', () => {
    it('should return an empty array when asynchronously invoked', () => {
        const nodes = createTestElement();
        const event = new CustomEvent('test', { bubbles: true, composed: true });

        let _event;
        nodes['c-container'].addEventListener(event.type, (event) => {
            _event = event;
        });

        nodes.child_div.dispatchEvent(event);

        expect(_event.composedPath()).toHaveSize(0);
    });

    it('should not throw when invoked on an event with a target that is not an instance of Node', async () => {
        const req = new XMLHttpRequest();
        const event = await new Promise((resolve) => {
            req.addEventListener('test', resolve);
            req.dispatchEvent(new CustomEvent('test'));
        });
        // Not looking at return value because browsers have different implementations.
        expect(() => {
            event.composedPath();
        }).not.toThrowError();
    });

    it('should return expected composed path when the target is a text node', async () => {
        const nodes = createTestElement();
        const event = new CustomEvent('test', { bubbles: true, composed: false });

        const textNode = nodes.child_div.childNodes[0];

        const composedPath = await new Promise((resolve) => {
            textNode.addEventListener('test', (event) => {
                resolve(event.composedPath());
            });
            textNode.dispatchEvent(event);
        });

        expect(composedPath).toEqual([textNode, nodes.child_div, nodes['c-child.shadowRoot']]);
    });
});
