// Inspired from WPT:
// https://github.com/web-platform-tests/wpt/blob/master/shadow-dom/event-inside-shadow-tree.html

import { createElement } from 'lwc';
import Container from 'c/container';
import { extractDataIds } from '../../../helpers/utils.js';

function dispatchEventWithLog(target, nodes, event) {
    const log = [];

    [...Object.values(nodes), document.body, document.documentElement, document, window].forEach(
        (node) => {
            node.addEventListener(event.type, (event) => {
                log.push([node, event.target, event.composedPath()]);
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

function createDisconnectedTestElement() {
    const fragment = document.createDocumentFragment();
    const elm = createElement('c-container', { is: Container });
    elm.setAttribute('data-id', 'c-container');

    const doAppend = () => fragment.appendChild(elm);

    if (!lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE) {
        doAppend();
    } else {
        // Expected warning, since we are working with disconnected nodes
        expect(doAppend).toLogWarningDev(
            Array(4)
                .fill()
                .map(
                    () =>
                        /fired a `connectedCallback` and rendered, but was not connected to the DOM/
                )
        );
    }

    const nodes = extractDataIds(elm);
    // Manually added because document fragments can't have attributes.
    nodes.fragment = fragment;
    return nodes;
}

describe('event propagation', () => {
    describe('dispatched on native element', () => {
        it('{bubbles: true, composed: true}', () => {
            const nodes = createTestElement();
            const event = new CustomEvent('test', { bubbles: true, composed: true });
            const actualLogs = dispatchEventWithLog(nodes.button, nodes, event);

            const composedPath = [
                nodes.button,
                nodes.button_div,
                nodes['c-button'].shadowRoot,
                nodes['c-button'],
                nodes.button_group_slot,
                nodes.button_group_internal_slot,
                nodes['c-button-group-internal'].shadowRoot,
                nodes['c-button-group-internal'],
                nodes.button_group_div,
                nodes['c-button-group'].shadowRoot,
                nodes['c-button-group'],
                nodes.container_div,
                nodes['c-container'].shadowRoot,
                nodes['c-container'],
                document.body,
                document.documentElement,
                document,
                window,
            ];
            const expectedLogs = [
                [nodes.button, nodes.button, composedPath],
                [nodes.button_div, nodes.button, composedPath],
                [nodes['c-button'].shadowRoot, nodes.button, composedPath],
                [nodes['c-button'], nodes['c-button'], composedPath],
                [nodes.button_group_slot, nodes['c-button'], composedPath],
                [nodes.button_group_internal_slot, nodes['c-button'], composedPath],
                [nodes['c-button-group-internal'].shadowRoot, nodes['c-button'], composedPath],
                [nodes['c-button-group-internal'], nodes['c-button'], composedPath],
                [nodes.button_group_div, nodes['c-button'], composedPath],
                [nodes['c-button-group'].shadowRoot, nodes['c-button'], composedPath],
                [nodes['c-button-group'], nodes['c-button'], composedPath],
                [nodes.container_div, nodes['c-button'], composedPath],
                [nodes['c-container'].shadowRoot, nodes['c-button'], composedPath],
                [nodes['c-container'], nodes['c-container'], composedPath],
                [document.body, nodes['c-container'], composedPath],
                [document.documentElement, nodes['c-container'], composedPath],
                [document, nodes['c-container'], composedPath],
                [window, nodes['c-container'], composedPath],
            ];

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: false, composed: true}', () => {
            const nodes = createTestElement();
            const event = new CustomEvent('test', { bubbles: false, composed: true });
            const actualLogs = dispatchEventWithLog(nodes.button, nodes, event);

            const composedPath = [
                nodes.button,
                nodes.button_div,
                nodes['c-button'].shadowRoot,
                nodes['c-button'],
                nodes.button_group_slot,
                nodes.button_group_internal_slot,
                nodes['c-button-group-internal'].shadowRoot,
                nodes['c-button-group-internal'],
                nodes.button_group_div,
                nodes['c-button-group'].shadowRoot,
                nodes['c-button-group'],
                nodes.container_div,
                nodes['c-container'].shadowRoot,
                nodes['c-container'],
                document.body,
                document.documentElement,
                document,
                window,
            ];

            let expectedLogs;
            if (process.env.NATIVE_SHADOW) {
                expectedLogs = [
                    [nodes.button, nodes.button, composedPath],
                    [nodes['c-button'], nodes['c-button'], composedPath],
                    [nodes['c-container'], nodes['c-container'], composedPath],
                ];
            } else {
                // TODO [#1138]: {bubbles: false, composed: true} events should invoke event listeners on ancestor hosts
                expectedLogs = [[nodes.button, nodes.button, composedPath]];
            }

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: true, composed: false}', () => {
            const nodes = createTestElement();
            const event = new CustomEvent('test', { bubbles: true, composed: false });
            const actualLogs = dispatchEventWithLog(nodes.button, nodes, event);

            const composedPath = [nodes.button, nodes.button_div, nodes['c-button'].shadowRoot];

            const expectedLogs = [
                [nodes.button, nodes.button, composedPath],
                [nodes.button_div, nodes.button, composedPath],
                [nodes['c-button'].shadowRoot, nodes.button, composedPath],
            ];

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: false, composed: false}', () => {
            const nodes = createTestElement();
            const event = new CustomEvent('test', { bubbles: false, composed: false });
            const actualLogs = dispatchEventWithLog(nodes.button, nodes, event);

            const composedPath = [nodes.button, nodes.button_div, nodes['c-button'].shadowRoot];
            const expectedLogs = [[nodes.button, nodes.button, composedPath]];

            expect(actualLogs).toEqual(expectedLogs);
        });
    });

    describe('dispatched on host element', () => {
        it('{bubbles: true, composed: true}', () => {
            const nodes = createTestElement();
            const event = new CustomEvent('test', { bubbles: true, composed: true });
            const actualLogs = dispatchEventWithLog(nodes['c-button'], nodes, event);

            const composedPath = [
                nodes['c-button'],
                nodes.button_group_slot,
                nodes.button_group_internal_slot,
                nodes['c-button-group-internal'].shadowRoot,
                nodes['c-button-group-internal'],
                nodes.button_group_div,
                nodes['c-button-group'].shadowRoot,
                nodes['c-button-group'],
                nodes.container_div,
                nodes['c-container'].shadowRoot,
                nodes['c-container'],
                document.body,
                document.documentElement,
                document,
                window,
            ];
            const expectedLogs = [
                [nodes['c-button'], nodes['c-button'], composedPath],
                [nodes.button_group_slot, nodes['c-button'], composedPath],
                [nodes.button_group_internal_slot, nodes['c-button'], composedPath],
                [nodes['c-button-group-internal'].shadowRoot, nodes['c-button'], composedPath],
                [nodes['c-button-group-internal'], nodes['c-button'], composedPath],
                [nodes.button_group_div, nodes['c-button'], composedPath],
                [nodes['c-button-group'].shadowRoot, nodes['c-button'], composedPath],
                [nodes['c-button-group'], nodes['c-button'], composedPath],
                [nodes.container_div, nodes['c-button'], composedPath],
                [nodes['c-container'].shadowRoot, nodes['c-button'], composedPath],
                [nodes['c-container'], nodes['c-container'], composedPath],
                [document.body, nodes['c-container'], composedPath],
                [document.documentElement, nodes['c-container'], composedPath],
                [document, nodes['c-container'], composedPath],
                [window, nodes['c-container'], composedPath],
            ];

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: true, composed: false}', () => {
            const nodes = createTestElement();
            const event = new CustomEvent('test', { bubbles: true, composed: false });
            const actualLogs = dispatchEventWithLog(nodes['c-button'], nodes, event);

            const composedPath = [
                nodes['c-button'],
                nodes.button_group_slot,
                nodes.button_group_internal_slot,
                nodes['c-button-group-internal'].shadowRoot,
                nodes['c-button-group-internal'],
                nodes.button_group_div,
                nodes['c-button-group'].shadowRoot,
                nodes['c-button-group'],
                nodes.container_div,
                nodes['c-container'].shadowRoot,
            ];

            const expectedLogs = [
                [nodes['c-button'], nodes['c-button'], composedPath],
                [nodes.button_group_slot, nodes['c-button'], composedPath],
                [nodes.button_group_internal_slot, nodes['c-button'], composedPath],
                [nodes['c-button-group-internal'].shadowRoot, nodes['c-button'], composedPath],
                [nodes['c-button-group-internal'], nodes['c-button'], composedPath],
                [nodes.button_group_div, nodes['c-button'], composedPath],
                [nodes['c-button-group'].shadowRoot, nodes['c-button'], composedPath],
                [nodes['c-button-group'], nodes['c-button'], composedPath],
                [nodes.container_div, nodes['c-button'], composedPath],
                [nodes['c-container'].shadowRoot, nodes['c-button'], composedPath],
            ];

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: false, composed: true}', () => {
            const nodes = createTestElement();
            const event = new CustomEvent('test', { bubbles: false, composed: true });
            const actualLogs = dispatchEventWithLog(nodes['c-button'], nodes, event);

            const composedPath = [
                nodes['c-button'],
                nodes.button_group_slot,
                nodes.button_group_internal_slot,
                nodes['c-button-group-internal'].shadowRoot,
                nodes['c-button-group-internal'],
                nodes.button_group_div,
                nodes['c-button-group'].shadowRoot,
                nodes['c-button-group'],
                nodes.container_div,
                nodes['c-container'].shadowRoot,
                nodes['c-container'],
                document.body,
                document.documentElement,
                document,
                window,
            ];

            let expectedLogs;
            if (process.env.NATIVE_SHADOW) {
                expectedLogs = [
                    [nodes['c-button'], nodes['c-button'], composedPath],
                    [nodes['c-container'], nodes['c-container'], composedPath],
                ];
            } else {
                expectedLogs = [[nodes['c-button'], nodes['c-button'], composedPath]];
            }

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: false, composed: false}', () => {
            const nodes = createTestElement();
            const event = new CustomEvent('test', { bubbles: false, composed: false });
            const actualLogs = dispatchEventWithLog(nodes['c-button'], nodes, event);

            const composedPath = [
                nodes['c-button'],
                nodes.button_group_slot,
                nodes.button_group_internal_slot,
                nodes['c-button-group-internal'].shadowRoot,
                nodes['c-button-group-internal'],
                nodes.button_group_div,
                nodes['c-button-group'].shadowRoot,
                nodes['c-button-group'],
                nodes.container_div,
                nodes['c-container'].shadowRoot,
            ];
            const expectedLogs = [[nodes['c-button'], nodes['c-button'], composedPath]];

            expect(actualLogs).toEqual(expectedLogs);
        });
    });

    describe('dispatched on shadow root', () => {
        it('{bubbles: true, composed: true}', () => {
            const nodes = createTestElement();
            const event = new CustomEvent('test', { bubbles: true, composed: true });
            const actualLogs = dispatchEventWithLog(nodes['c-button'].shadowRoot, nodes, event);

            const composedPath = [
                nodes['c-button'].shadowRoot,
                nodes['c-button'],
                nodes.button_group_slot,
                nodes.button_group_internal_slot,
                nodes['c-button-group-internal'].shadowRoot,
                nodes['c-button-group-internal'],
                nodes.button_group_div,
                nodes['c-button-group'].shadowRoot,
                nodes['c-button-group'],
                nodes.container_div,
                nodes['c-container'].shadowRoot,
                nodes['c-container'],
                document.body,
                document.documentElement,
                document,
                window,
            ];
            const expectedLogs = [
                [nodes['c-button'].shadowRoot, nodes['c-button'].shadowRoot, composedPath],
                [nodes['c-button'], nodes['c-button'], composedPath],
                [nodes.button_group_slot, nodes['c-button'], composedPath],
                [nodes.button_group_internal_slot, nodes['c-button'], composedPath],
                [nodes['c-button-group-internal'].shadowRoot, nodes['c-button'], composedPath],
                [nodes['c-button-group-internal'], nodes['c-button'], composedPath],
                [nodes.button_group_div, nodes['c-button'], composedPath],
                [nodes['c-button-group'].shadowRoot, nodes['c-button'], composedPath],
                [nodes['c-button-group'], nodes['c-button'], composedPath],
                [nodes.container_div, nodes['c-button'], composedPath],
                [nodes['c-container'].shadowRoot, nodes['c-button'], composedPath],
                [nodes['c-container'], nodes['c-container'], composedPath],
                [document.body, nodes['c-container'], composedPath],
                [document.documentElement, nodes['c-container'], composedPath],
                [document, nodes['c-container'], composedPath],
                [window, nodes['c-container'], composedPath],
            ];

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: false, composed: true}', () => {
            const nodes = createTestElement();
            const event = new CustomEvent('test', { bubbles: false, composed: true });
            const actualLogs = dispatchEventWithLog(nodes['c-button'].shadowRoot, nodes, event);

            const composedPath = [
                nodes['c-button'].shadowRoot,
                nodes['c-button'],
                nodes.button_group_slot,
                nodes.button_group_internal_slot,
                nodes['c-button-group-internal'].shadowRoot,
                nodes['c-button-group-internal'],
                nodes.button_group_div,
                nodes['c-button-group'].shadowRoot,
                nodes['c-button-group'],
                nodes.container_div,
                nodes['c-container'].shadowRoot,
                nodes['c-container'],
                document.body,
                document.documentElement,
                document,
                window,
            ];

            let expectedLogs;
            if (process.env.NATIVE_SHADOW) {
                expectedLogs = [
                    [nodes['c-button'].shadowRoot, nodes['c-button'].shadowRoot, composedPath],
                    [nodes['c-button'], nodes['c-button'], composedPath],
                    [nodes['c-container'], nodes['c-container'], composedPath],
                ];
            } else {
                expectedLogs = [
                    [nodes['c-button'].shadowRoot, nodes['c-button'].shadowRoot, composedPath],
                    [nodes['c-button'], nodes['c-button'], composedPath],
                ];
            }

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: true, composed: false}', () => {
            const nodes = createTestElement();
            const event = new CustomEvent('test', { bubbles: true, composed: false });
            const actualLogs = dispatchEventWithLog(nodes['c-button'].shadowRoot, nodes, event);

            const composedPath = [nodes['c-button'].shadowRoot];
            const expectedLogs = [
                [nodes['c-button'].shadowRoot, nodes['c-button'].shadowRoot, composedPath],
            ];

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: false, composed: false}', () => {
            const nodes = createTestElement();
            const event = new CustomEvent('test', { bubbles: false, composed: false });
            const actualLogs = dispatchEventWithLog(nodes['c-button'].shadowRoot, nodes, event);

            const composedPath = [nodes['c-button'].shadowRoot];
            const expectedLogs = [
                [nodes['c-button'].shadowRoot, nodes['c-button'].shadowRoot, composedPath],
            ];

            expect(actualLogs).toEqual(expectedLogs);
        });
    });

    describe('dispatched on lwc:dom="manual" node', () => {
        it('{bubbles: true, composed: true}', async () => {
            const nodes = createTestElement();
            const event = new CustomEvent('test', { bubbles: true, composed: true });

            const composedPath = [
                nodes.container_span_manual,
                nodes.container_span,
                nodes['c-container'].shadowRoot,
                nodes['c-container'],
                document.body,
                document.documentElement,
                document,
                window,
            ];
            const expectedLogs = [
                [nodes.container_span_manual, nodes.container_span_manual, composedPath],
                [nodes.container_span, nodes.container_span_manual, composedPath],
                [nodes['c-container'].shadowRoot, nodes.container_span_manual, composedPath],
                [nodes['c-container'], nodes['c-container'], composedPath],
                [document.body, nodes['c-container'], composedPath],
                [document.documentElement, nodes['c-container'], composedPath],
                [document, nodes['c-container'], composedPath],
                [window, nodes['c-container'], composedPath],
            ];

            await new Promise(setTimeout);
            const actualLogs = dispatchEventWithLog(nodes.container_span_manual, nodes, event);
            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: true, composed: false}', async () => {
            const nodes = createTestElement();
            const event = new CustomEvent('test', { bubbles: true, composed: false });

            const composedPath = [
                nodes.container_span_manual,
                nodes.container_span,
                nodes['c-container.shadowRoot'],
            ];
            const expectedLogs = [
                [nodes.container_span_manual, nodes.container_span_manual, composedPath],
                [nodes.container_span, nodes.container_span_manual, composedPath],
                [nodes['c-container'].shadowRoot, nodes.container_span_manual, composedPath],
            ];

            await Promise.resolve();
            const actualLogs = dispatchEventWithLog(nodes.container_span_manual, nodes, event);
            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: false, composed: true}', async () => {
            const nodes = createTestElement();
            const event = new CustomEvent('test', { bubbles: false, composed: true });

            const composedPath = [
                nodes.container_span_manual,
                nodes.container_span,
                nodes['c-container.shadowRoot'],
                nodes['c-container'],
                document.body,
                document.documentElement,
                document,
                window,
            ];

            let expectedLogs;
            if (process.env.NATIVE_SHADOW) {
                expectedLogs = [
                    [nodes.container_span_manual, nodes.container_span_manual, composedPath],
                    [nodes['c-container'], nodes['c-container'], composedPath],
                ];
            } else {
                expectedLogs = [
                    [nodes.container_span_manual, nodes.container_span_manual, composedPath],
                ];
            }

            await Promise.resolve();
            const actualLogs = dispatchEventWithLog(nodes.container_span_manual, nodes, event);
            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: false, composed: false}', async () => {
            const nodes = createTestElement();
            const event = new CustomEvent('test', { bubbles: false, composed: false });

            const composedPath = [
                nodes.container_span_manual,
                nodes.container_span,
                nodes['c-container.shadowRoot'],
            ];
            const expectedLogs = [
                [nodes.container_span_manual, nodes.container_span_manual, composedPath],
            ];

            await Promise.resolve();
            const actualLogs = dispatchEventWithLog(nodes.container_span_manual, nodes, event);
            expect(actualLogs).toEqual(expectedLogs);
        });
    });

    // This test does not work with native custom element lifecycle because disconnected
    // fragments cannot fire connectedCallback/disconnectedCallback events
    describe.runIf(lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE)(
        'dispatched within a disconnected tree',
        () => {
            it('{bubbles: true, composed: true}', () => {
                const nodes = createDisconnectedTestElement();
                const event = new CustomEvent('test', { bubbles: true, composed: true });

                const composedPath = [
                    nodes.container_div,
                    nodes['c-container'].shadowRoot,
                    nodes['c-container'],
                    nodes.fragment,
                ];
                const expectedLogs = [
                    [nodes.container_div, nodes.container_div, composedPath],
                    [nodes['c-container'].shadowRoot, nodes.container_div, composedPath],
                    [nodes['c-container'], nodes['c-container'], composedPath],
                    [nodes.fragment, nodes['c-container'], composedPath],
                ];

                const actualLogs = dispatchEventWithLog(nodes.container_div, nodes, event);
                expect(actualLogs).toEqual(expectedLogs);
            });

            it('{bubbles: true, composed: false}', () => {
                const nodes = createDisconnectedTestElement();
                const event = new CustomEvent('test', { bubbles: true, composed: false });

                const composedPath = [nodes.container_div, nodes['c-container'].shadowRoot];
                const expectedLogs = [
                    [nodes.container_div, nodes.container_div, composedPath],
                    [nodes['c-container'].shadowRoot, nodes.container_div, composedPath],
                ];

                const actualLogs = dispatchEventWithLog(nodes.container_div, nodes, event);
                expect(actualLogs).toEqual(expectedLogs);
            });

            it('{bubbles: false, composed: true}', () => {
                const nodes = createDisconnectedTestElement();
                const event = new CustomEvent('test', { bubbles: false, composed: true });

                const composedPath = [
                    nodes.container_div,
                    nodes['c-container'].shadowRoot,
                    nodes['c-container'],
                    nodes.fragment,
                ];

                let expectedLogs;
                if (process.env.NATIVE_SHADOW) {
                    expectedLogs = [
                        [nodes.container_div, nodes.container_div, composedPath],
                        [nodes['c-container'], nodes['c-container'], composedPath],
                    ];
                } else {
                    expectedLogs = [[nodes.container_div, nodes.container_div, composedPath]];
                }

                const actualLogs = dispatchEventWithLog(nodes.container_div, nodes, event);
                expect(actualLogs).toEqual(expectedLogs);
            });

            it('{bubbles: false, composed: false}', () => {
                const nodes = createDisconnectedTestElement();
                const event = new CustomEvent('test', { bubbles: false, composed: false });

                const composedPath = [nodes.container_div, nodes['c-container'].shadowRoot];
                const expectedLogs = [[nodes.container_div, nodes.container_div, composedPath]];

                const actualLogs = dispatchEventWithLog(nodes.container_div, nodes, event);
                expect(actualLogs).toEqual(expectedLogs);
            });
        }
    );
});

describe('declarative event listener', () => {
    it('when dispatching instance of Event', () => {
        const nodes = createTestElement();
        const event = new Event('test', { bubbles: true, composed: true });
        nodes.button.dispatchEvent(event);

        expect(nodes['c-container'].testEventReceived).toBeTrue();
    });

    it('when dispatching instance of CustomEvent', () => {
        const nodes = createTestElement();
        const event = new CustomEvent('test', { bubbles: true, composed: true });
        nodes.button.dispatchEvent(event);

        expect(nodes['c-container'].testEventReceived).toBeTrue();
    });
});
