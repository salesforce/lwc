// Inspired from WPT:
// https://github.com/web-platform-tests/wpt/blob/master/shadow-dom/event-inside-shadow-tree.html

import { createElement, setFeatureFlagForTest } from 'lwc';
import { extractDataIds } from 'test-utils';

import Container from 'x/container';

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
    const elm = createElement('x-container', { is: Container });
    elm.setAttribute('data-id', 'x-container');
    document.body.appendChild(elm);
    return extractDataIds(elm);
}

describe('event propagation', () => {
    describe('dispatched on native element', () => {
        let nodes;
        beforeEach(() => {
            nodes = createTestElement();
        });

        it('{bubbles: true, composed: true}', () => {
            const event = new CustomEvent('test', { bubbles: true, composed: true });
            const actualLogs = dispatchEventWithLog(nodes.button, nodes, event);

            const composedPath = [
                nodes.button,
                nodes.button_div,
                nodes['x-button'].shadowRoot,
                nodes['x-button'],
                nodes.button_group_slot,
                nodes.button_group_internal_slot,
                nodes['x-button-group-internal'].shadowRoot,
                nodes['x-button-group-internal'],
                nodes.button_group_div,
                nodes['x-button-group'].shadowRoot,
                nodes['x-button-group'],
                nodes.container_div,
                nodes['x-container'].shadowRoot,
                nodes['x-container'],
                document.body,
                document.documentElement,
                document,
                window,
            ];
            const expectedLogs = [
                [nodes.button, nodes.button, composedPath],
                [nodes.button_div, nodes.button, composedPath],
                [nodes['x-button'].shadowRoot, nodes.button, composedPath],
                [nodes['x-button'], nodes['x-button'], composedPath],
                [nodes.button_group_slot, nodes['x-button'], composedPath],
                [nodes.button_group_internal_slot, nodes['x-button'], composedPath],
                [nodes['x-button-group-internal'].shadowRoot, nodes['x-button'], composedPath],
                [nodes['x-button-group-internal'], nodes['x-button'], composedPath],
                [nodes.button_group_div, nodes['x-button'], composedPath],
                [nodes['x-button-group'].shadowRoot, nodes['x-button'], composedPath],
                [nodes['x-button-group'], nodes['x-button'], composedPath],
                [nodes.container_div, nodes['x-button'], composedPath],
                [nodes['x-container'].shadowRoot, nodes['x-button'], composedPath],
                [nodes['x-container'], nodes['x-container'], composedPath],
                [document.body, nodes['x-container'], composedPath],
                [document.documentElement, nodes['x-container'], composedPath],
                [document, nodes['x-container'], composedPath],
                [window, nodes['x-container'], composedPath],
            ];

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: true, composed: false}', () => {
            const event = new CustomEvent('test', { bubbles: true, composed: false });
            const actualLogs = dispatchEventWithLog(nodes.button, nodes, event);

            const composedPath = [nodes.button, nodes.button_div, nodes['x-button'].shadowRoot];

            const expectedLogs = [
                [nodes.button, nodes.button, composedPath],
                [nodes.button_div, nodes.button, composedPath],
                [nodes['x-button'].shadowRoot, nodes.button, composedPath],
            ];

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: false, composed: true}', () => {
            const event = new CustomEvent('test', { bubbles: false, composed: true });
            const actualLogs = dispatchEventWithLog(nodes.button, nodes, event);

            const composedPath = [
                nodes.button,
                nodes.button_div,
                nodes['x-button'].shadowRoot,
                nodes['x-button'],
                nodes.button_group_slot,
                nodes.button_group_internal_slot,
                nodes['x-button-group-internal'].shadowRoot,
                nodes['x-button-group-internal'],
                nodes.button_group_div,
                nodes['x-button-group'].shadowRoot,
                nodes['x-button-group'],
                nodes.container_div,
                nodes['x-container'].shadowRoot,
                nodes['x-container'],
                document.body,
                document.documentElement,
                document,
                window,
            ];

            let expectedLogs;
            if (process.env.NATIVE_SHADOW) {
                expectedLogs = [
                    [nodes.button, nodes.button, composedPath],
                    [nodes['x-button'], nodes['x-button'], composedPath],
                    [nodes['x-container'], nodes['x-container'], composedPath],
                ];
            } else {
                // TODO [#1138]: {bubbles: false, composed: true} events should invoke event listeners on ancestor hosts
                expectedLogs = [[nodes.button, nodes.button, composedPath]];
            }

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: false, composed: false}', () => {
            const event = new CustomEvent('test', { bubbles: false, composed: false });
            const actualLogs = dispatchEventWithLog(nodes.button, nodes, event);

            const composedPath = [nodes.button, nodes.button_div, nodes['x-button'].shadowRoot];
            const expectedLogs = [[nodes.button, nodes.button, composedPath]];

            expect(actualLogs).toEqual(expectedLogs);
        });

        if (!process.env.NATIVE_SHADOW) {
            describe('when the ENABLE_NON_COMPOSED_EVENTS_LEAKAGE flag is enabled', () => {
                beforeEach(() => {
                    setFeatureFlagForTest('ENABLE_NON_COMPOSED_EVENTS_LEAKAGE', true);
                });
                afterEach(() => {
                    setFeatureFlagForTest('ENABLE_NON_COMPOSED_EVENTS_LEAKAGE', false);
                });

                it('{bubbles: true, composed: false}', () => {
                    const event = new CustomEvent('test', { bubbles: true, composed: false });
                    const actualLogs = dispatchEventWithLog(nodes.button, nodes, event);
                    const composedPath = [
                        nodes.button,
                        nodes.button_div,
                        nodes['x-button'].shadowRoot,
                    ];

                    const expectedLogs = [
                        [nodes.button, nodes.button, composedPath],
                        [nodes.button_div, nodes.button, composedPath],
                        [nodes['x-button'].shadowRoot, nodes.button, composedPath],
                        [nodes.button_group_slot, null, composedPath],
                        [nodes.button_group_internal_slot, null, composedPath],
                        [nodes.button_group_div, null, composedPath],
                        [nodes.container_div, null, composedPath],
                        [document.body, null, composedPath],
                        [document.documentElement, null, composedPath],
                        [document, null, composedPath],
                        [window, null, composedPath],
                    ];

                    expect(actualLogs).toEqual(expectedLogs);
                });
            });
        }
    });

    describe('dispatched on host element', () => {
        let nodes;
        beforeEach(() => {
            nodes = createTestElement();
        });

        it('{bubbles: true, composed: true}', () => {
            const event = new CustomEvent('test', { bubbles: true, composed: true });
            const actualLogs = dispatchEventWithLog(nodes['x-button'], nodes, event);

            const composedPath = [
                nodes['x-button'],
                nodes.button_group_slot,
                nodes.button_group_internal_slot,
                nodes['x-button-group-internal'].shadowRoot,
                nodes['x-button-group-internal'],
                nodes.button_group_div,
                nodes['x-button-group'].shadowRoot,
                nodes['x-button-group'],
                nodes.container_div,
                nodes['x-container'].shadowRoot,
                nodes['x-container'],
                document.body,
                document.documentElement,
                document,
                window,
            ];
            const expectedLogs = [
                [nodes['x-button'], nodes['x-button'], composedPath],
                [nodes.button_group_slot, nodes['x-button'], composedPath],
                [nodes.button_group_internal_slot, nodes['x-button'], composedPath],
                [nodes['x-button-group-internal'].shadowRoot, nodes['x-button'], composedPath],
                [nodes['x-button-group-internal'], nodes['x-button'], composedPath],
                [nodes.button_group_div, nodes['x-button'], composedPath],
                [nodes['x-button-group'].shadowRoot, nodes['x-button'], composedPath],
                [nodes['x-button-group'], nodes['x-button'], composedPath],
                [nodes.container_div, nodes['x-button'], composedPath],
                [nodes['x-container'].shadowRoot, nodes['x-button'], composedPath],
                [nodes['x-container'], nodes['x-container'], composedPath],
                [document.body, nodes['x-container'], composedPath],
                [document.documentElement, nodes['x-container'], composedPath],
                [document, nodes['x-container'], composedPath],
                [window, nodes['x-container'], composedPath],
            ];

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: true, composed: false}', () => {
            const event = new CustomEvent('test', { bubbles: true, composed: false });
            const actualLogs = dispatchEventWithLog(nodes['x-button'], nodes, event);

            const composedPath = [
                nodes['x-button'],
                nodes.button_group_slot,
                nodes.button_group_internal_slot,
                nodes['x-button-group-internal'].shadowRoot,
                nodes['x-button-group-internal'],
                nodes.button_group_div,
                nodes['x-button-group'].shadowRoot,
                nodes['x-button-group'],
                nodes.container_div,
                nodes['x-container'].shadowRoot,
            ];

            const expectedLogs = [
                [nodes['x-button'], nodes['x-button'], composedPath],
                [nodes.button_group_slot, nodes['x-button'], composedPath],
                [nodes.button_group_internal_slot, nodes['x-button'], composedPath],
                [nodes['x-button-group-internal'].shadowRoot, nodes['x-button'], composedPath],
                [nodes['x-button-group-internal'], nodes['x-button'], composedPath],
                [nodes.button_group_div, nodes['x-button'], composedPath],
                [nodes['x-button-group'].shadowRoot, nodes['x-button'], composedPath],
                [nodes['x-button-group'], nodes['x-button'], composedPath],
                [nodes.container_div, nodes['x-button'], composedPath],
                [nodes['x-container'].shadowRoot, nodes['x-button'], composedPath],
            ];

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: false, composed: true}', () => {
            const event = new CustomEvent('test', { bubbles: false, composed: true });
            const actualLogs = dispatchEventWithLog(nodes['x-button'], nodes, event);

            const composedPath = [
                nodes['x-button'],
                nodes.button_group_slot,
                nodes.button_group_internal_slot,
                nodes['x-button-group-internal'].shadowRoot,
                nodes['x-button-group-internal'],
                nodes.button_group_div,
                nodes['x-button-group'].shadowRoot,
                nodes['x-button-group'],
                nodes.container_div,
                nodes['x-container'].shadowRoot,
                nodes['x-container'],
                document.body,
                document.documentElement,
                document,
                window,
            ];

            let expectedLogs;
            if (process.env.NATIVE_SHADOW) {
                expectedLogs = [
                    [nodes['x-button'], nodes['x-button'], composedPath],
                    [nodes['x-container'], nodes['x-container'], composedPath],
                ];
            } else {
                expectedLogs = [[nodes['x-button'], nodes['x-button'], composedPath]];
            }

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: false, composed: false}', () => {
            const event = new CustomEvent('test', { bubbles: false, composed: false });
            const actualLogs = dispatchEventWithLog(nodes['x-button'], nodes, event);

            const composedPath = [
                nodes['x-button'],
                nodes.button_group_slot,
                nodes.button_group_internal_slot,
                nodes['x-button-group-internal'].shadowRoot,
                nodes['x-button-group-internal'],
                nodes.button_group_div,
                nodes['x-button-group'].shadowRoot,
                nodes['x-button-group'],
                nodes.container_div,
                nodes['x-container'].shadowRoot,
            ];
            const expectedLogs = [[nodes['x-button'], nodes['x-button'], composedPath]];

            expect(actualLogs).toEqual(expectedLogs);
        });

        if (!process.env.NATIVE_SHADOW) {
            describe('when the ENABLE_NON_COMPOSED_EVENTS_LEAKAGE flag is enabled', () => {
                beforeEach(() => {
                    setFeatureFlagForTest('ENABLE_NON_COMPOSED_EVENTS_LEAKAGE', true);
                });
                afterEach(() => {
                    setFeatureFlagForTest('ENABLE_NON_COMPOSED_EVENTS_LEAKAGE', false);
                });

                it('{bubbles: true, composed: false}', () => {
                    const event = new CustomEvent('test', { bubbles: true, composed: false });
                    const actualLogs = dispatchEventWithLog(nodes['x-button'], nodes, event);

                    const composedPath = [
                        nodes['x-button'],
                        nodes.button_group_slot,
                        nodes.button_group_internal_slot,
                        nodes['x-button-group-internal'].shadowRoot,
                        nodes['x-button-group-internal'],
                        nodes.button_group_div,
                        nodes['x-button-group'].shadowRoot,
                        nodes['x-button-group'],
                        nodes.container_div,
                        nodes['x-container'].shadowRoot,
                    ];

                    const expectedLogs = [
                        [nodes['x-button'], nodes['x-button'], composedPath],
                        [nodes.button_group_slot, nodes['x-button'], composedPath],
                        [nodes.button_group_internal_slot, nodes['x-button'], composedPath],
                        [
                            nodes['x-button-group-internal'].shadowRoot,
                            nodes['x-button'],
                            composedPath,
                        ],
                        [nodes['x-button-group-internal'], nodes['x-button'], composedPath],
                        [nodes.button_group_div, nodes['x-button'], composedPath],
                        [nodes['x-button-group'].shadowRoot, nodes['x-button'], composedPath],
                        [nodes['x-button-group'], nodes['x-button'], composedPath],
                        [nodes.container_div, nodes['x-button'], composedPath],
                        [nodes['x-container'].shadowRoot, nodes['x-button'], composedPath],
                        [document.body, null, composedPath],
                        [document.documentElement, null, composedPath],
                        [document, null, composedPath],
                        [window, null, composedPath],
                    ];

                    expect(actualLogs).toEqual(expectedLogs);
                });
            });
        }
    });

    describe('dispatched on shadow root', () => {
        let nodes;
        beforeEach(() => {
            nodes = createTestElement();
        });

        it('{bubbles: true, composed: true}', () => {
            const event = new CustomEvent('test', { bubbles: true, composed: true });
            const actualLogs = dispatchEventWithLog(nodes['x-button'].shadowRoot, nodes, event);

            const composedPath = [
                nodes['x-button'].shadowRoot,
                nodes['x-button'],
                nodes.button_group_slot,
                nodes.button_group_internal_slot,
                nodes['x-button-group-internal'].shadowRoot,
                nodes['x-button-group-internal'],
                nodes.button_group_div,
                nodes['x-button-group'].shadowRoot,
                nodes['x-button-group'],
                nodes.container_div,
                nodes['x-container'].shadowRoot,
                nodes['x-container'],
                document.body,
                document.documentElement,
                document,
                window,
            ];
            const expectedLogs = [
                [nodes['x-button'].shadowRoot, nodes['x-button'].shadowRoot, composedPath],
                [nodes['x-button'], nodes['x-button'], composedPath],
                [nodes.button_group_slot, nodes['x-button'], composedPath],
                [nodes.button_group_internal_slot, nodes['x-button'], composedPath],
                [nodes['x-button-group-internal'].shadowRoot, nodes['x-button'], composedPath],
                [nodes['x-button-group-internal'], nodes['x-button'], composedPath],
                [nodes.button_group_div, nodes['x-button'], composedPath],
                [nodes['x-button-group'].shadowRoot, nodes['x-button'], composedPath],
                [nodes['x-button-group'], nodes['x-button'], composedPath],
                [nodes.container_div, nodes['x-button'], composedPath],
                [nodes['x-container'].shadowRoot, nodes['x-button'], composedPath],
                [nodes['x-container'], nodes['x-container'], composedPath],
                [document.body, nodes['x-container'], composedPath],
                [document.documentElement, nodes['x-container'], composedPath],
                [document, nodes['x-container'], composedPath],
                [window, nodes['x-container'], composedPath],
            ];

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: true, composed: false}', () => {
            const event = new CustomEvent('test', { bubbles: true, composed: false });
            const actualLogs = dispatchEventWithLog(nodes['x-button'].shadowRoot, nodes, event);

            const composedPath = [nodes['x-button'].shadowRoot];
            const expectedLogs = [
                [nodes['x-button'].shadowRoot, nodes['x-button'].shadowRoot, composedPath],
            ];

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: false, composed: true}', () => {
            const event = new CustomEvent('test', { bubbles: false, composed: true });
            const actualLogs = dispatchEventWithLog(nodes['x-button'].shadowRoot, nodes, event);

            const composedPath = [
                nodes['x-button'].shadowRoot,
                nodes['x-button'],
                nodes.button_group_slot,
                nodes.button_group_internal_slot,
                nodes['x-button-group-internal'].shadowRoot,
                nodes['x-button-group-internal'],
                nodes.button_group_div,
                nodes['x-button-group'].shadowRoot,
                nodes['x-button-group'],
                nodes.container_div,
                nodes['x-container'].shadowRoot,
                nodes['x-container'],
                document.body,
                document.documentElement,
                document,
                window,
            ];

            let expectedLogs;
            if (process.env.NATIVE_SHADOW) {
                expectedLogs = [
                    [nodes['x-button'].shadowRoot, nodes['x-button'].shadowRoot, composedPath],
                    [nodes['x-button'], nodes['x-button'], composedPath],
                    [nodes['x-container'], nodes['x-container'], composedPath],
                ];
            } else {
                expectedLogs = [
                    [nodes['x-button'].shadowRoot, nodes['x-button'].shadowRoot, composedPath],
                    [nodes['x-button'], nodes['x-button'], composedPath],
                ];
            }

            expect(actualLogs).toEqual(expectedLogs);
        });

        it('{bubbles: false, composed: false}', () => {
            const event = new CustomEvent('test', { bubbles: false, composed: false });
            const actualLogs = dispatchEventWithLog(nodes['x-button'].shadowRoot, nodes, event);

            const composedPath = [nodes['x-button'].shadowRoot];
            const expectedLogs = [
                [nodes['x-button'].shadowRoot, nodes['x-button'].shadowRoot, composedPath],
            ];

            expect(actualLogs).toEqual(expectedLogs);
        });
    });

    describe('dispatched on lwc:dom="manual" node', () => {
        if (!process.env.NATIVE_SHADOW) {
            describe('when the ENABLE_NON_COMPOSED_EVENTS_LEAKAGE flag is enabled', () => {
                beforeEach(() => {
                    setFeatureFlagForTest('ENABLE_NON_COMPOSED_EVENTS_LEAKAGE', true);
                });
                afterEach(() => {
                    setFeatureFlagForTest('ENABLE_NON_COMPOSED_EVENTS_LEAKAGE', false);
                });

                it('{bubbles: true, composed: false}', () => {
                    const nodes = createTestElement();
                    const event = new CustomEvent('test', { bubbles: true, composed: false });

                    const composedPath = [
                        nodes.container_span_manual,
                        nodes.container_span,
                        nodes['x-container'].shadowRoot,
                    ];
                    const expectedLogs = [
                        [nodes.container_span_manual, nodes.container_span_manual, composedPath],
                        [nodes.container_span, nodes.container_span_manual, composedPath],
                        [
                            nodes['x-container'].shadowRoot,
                            nodes.container_span_manual,
                            composedPath,
                        ],
                        [document.body, null, composedPath],
                        [document.documentElement, null, composedPath],
                        [document, null, composedPath],
                        [window, null, composedPath],
                    ];

                    return Promise.resolve().then(() => {
                        const actualLogs = dispatchEventWithLog(
                            nodes.container_span_manual,
                            nodes,
                            event
                        );
                        expect(actualLogs).toEqual(expectedLogs);
                    });
                });
            });
        }

        it('{bubbles: true, composed: true}', () => {
            const nodes = createTestElement();
            const event = new CustomEvent('test', { bubbles: true, composed: true });

            const composedPath = [
                nodes.container_span_manual,
                nodes.container_span,
                nodes['x-container'].shadowRoot,
                nodes['x-container'],
                document.body,
                document.documentElement,
                document,
                window,
            ];
            const expectedLogs = [
                [nodes.container_span_manual, nodes.container_span_manual, composedPath],
                [nodes.container_span, nodes.container_span_manual, composedPath],
                [nodes['x-container'].shadowRoot, nodes.container_span_manual, composedPath],
                [nodes['x-container'], nodes['x-container'], composedPath],
                [document.body, nodes['x-container'], composedPath],
                [document.documentElement, nodes['x-container'], composedPath],
                [document, nodes['x-container'], composedPath],
                [window, nodes['x-container'], composedPath],
            ];

            return Promise.resolve().then(() => {
                const actualLogs = dispatchEventWithLog(nodes.container_span_manual, nodes, event);
                expect(actualLogs).toEqual(expectedLogs);
            });
        });

        it('{bubbles: true, composed: false}', () => {
            const nodes = createTestElement();
            const event = new CustomEvent('test', { bubbles: true, composed: false });

            const composedPath = [
                nodes.container_span_manual,
                nodes.container_span,
                nodes['x-container.shadowRoot'],
            ];
            const expectedLogs = [
                [nodes.container_span_manual, nodes.container_span_manual, composedPath],
                [nodes.container_span, nodes.container_span_manual, composedPath],
                [nodes['x-container'].shadowRoot, nodes.container_span_manual, composedPath],
            ];

            return Promise.resolve().then(() => {
                const actualLogs = dispatchEventWithLog(nodes.container_span_manual, nodes, event);
                expect(actualLogs).toEqual(expectedLogs);
            });
        });

        it('{bubbles: false, composed: true}', () => {
            const nodes = createTestElement();
            const event = new CustomEvent('test', { bubbles: false, composed: true });

            const composedPath = [
                nodes.container_span_manual,
                nodes.container_span,
                nodes['x-container.shadowRoot'],
                nodes['x-container'],
                document.body,
                document.documentElement,
                document,
                window,
            ];

            let expectedLogs;
            if (process.env.NATIVE_SHADOW) {
                expectedLogs = [
                    [nodes.container_span_manual, nodes.container_span_manual, composedPath],
                    [nodes['x-container'], nodes['x-container'], composedPath],
                ];
            } else {
                expectedLogs = [
                    [nodes.container_span_manual, nodes.container_span_manual, composedPath],
                ];
            }

            return Promise.resolve().then(() => {
                const actualLogs = dispatchEventWithLog(nodes.container_span_manual, nodes, event);
                expect(actualLogs).toEqual(expectedLogs);
            });
        });

        it('{bubbles: false, composed: false}', () => {
            const nodes = createTestElement();
            const event = new CustomEvent('test', { bubbles: false, composed: false });

            const composedPath = [
                nodes.container_span_manual,
                nodes.container_span,
                nodes['x-container.shadowRoot'],
            ];
            const expectedLogs = [
                [nodes.container_span_manual, nodes.container_span_manual, composedPath],
            ];

            return Promise.resolve().then(() => {
                const actualLogs = dispatchEventWithLog(nodes.container_span_manual, nodes, event);
                expect(actualLogs).toEqual(expectedLogs);
            });
        });
    });
});
