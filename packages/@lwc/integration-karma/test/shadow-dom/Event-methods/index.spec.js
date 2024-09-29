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

describe('Event.composedPath', () => {
    it('should return an empty array when asynchronously invoked', async () => {
        const nodes = createTestElement();

        const event = await new Promise((resolve) => {
            nodes.container_div.addEventListener('test', resolve);
            nodes.child_div.dispatchEvent(
                new CustomEvent('test', { bubbles: true, composed: true })
            );
        });

        expect(event.composedPath().length).toBe(0);
    });

    it('should not throw when invoked on an event with a target that is not an instance of Node', async () => {
        const req = new XMLHttpRequest();

        const evt = await new Promise((resolve) => {
            req.addEventListener('test', resolve);
            req.dispatchEvent(new CustomEvent('test'));
        });

        // Not looking at return value because browsers have different implementations.
        expect(() => {
            evt.composedPath();
        }).not.toThrowError();
    });

    it('should return expected composed path when the target is a text node', () => {
        const nodes = createTestElement();
        const event = new CustomEvent('test', { bubbles: true, composed: false });

        const textNode = nodes.child_div.childNodes[0];
        return new Promise((done) => {
            textNode.addEventListener('test', (event) => {
                expect(event.composedPath()).toEqual([
                    textNode,
                    nodes.child_div,
                    nodes['x-child.shadowRoot'],
                ]);
                done();
            });

            textNode.dispatchEvent(event);
        });
    });
});
