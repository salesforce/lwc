import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';
// @ts-expect-error: missing types
import Container from 'x/container';

function dispatchEventWithLog(
    target: Node,
    nodes: { [s: string]: Node } | ArrayLike<Node>,
    event: CustomEvent<unknown>
) {
    const log: (Node | (Window & typeof globalThis))[] = [];
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

        const _event = await new Promise<Event>((resolve) => {
            nodes.container_div.addEventListener('test', (event) => {
                resolve(event);
            });
            nodes.child_div.dispatchEvent(
                new CustomEvent('test', { bubbles: true, composed: true })
            );
        });

        expect(_event.composedPath()).toHaveLength(0);
    });

    it('should not throw when invoked on an event with a target that is not an instance of Node', async () => {
        const req = new XMLHttpRequest();

        const evt = await new Promise<Event>((resolve) => {
            req.addEventListener('test', resolve);
            req.dispatchEvent(new CustomEvent('test'));
        });

        // Not looking at return value because browsers have different implementations.
        expect(() => {
            evt.composedPath();
        }).not.toThrowError();
    });

    it('should return expected composed path when the target is a text node', async () => {
        const nodes = createTestElement();
        const event = new CustomEvent('test', { bubbles: true, composed: false });

        const textNode = nodes.child_div.childNodes[0];

        const evt = await new Promise<Event>((resolve) => {
            textNode.addEventListener('test', resolve);
            textNode.dispatchEvent(event);
        });

        expect(evt.composedPath()).toEqual([textNode, nodes.child_div]);

        // textNode.addEventListener('test', (event) => {
        //     expect(event.composedPath()).toEqual([
        //         textNode,
        //         nodes.child_div,
        //         nodes['x-child.shadowRoot'],
        //     ]);
        //     done();
        // });

        // textNode.dispatchEvent(event);
    });
});
