import { createElement } from 'lwc';
import Child from 'c/child';
import Parent from 'c/parent';
import Lifecycle from 'c/lifecycle';
import Nested from 'c/nested';

import {
    isUserTimingSupported,
    patchUserTiming,
    resetUserTiming,
    resetMeasures,
    expectMeasureEquals,
} from './user-timing-utils';

function testConstructor(expected) {
    it('captures component constructor', () => {
        const elm = createElement('c-child', { is: Child });
        document.body.appendChild(elm);
        expectMeasureEquals(expected);
    });
}

function testRerender(expected) {
    it('component rerender', async () => {
        const elm = createElement('c-child', { is: Child });
        document.body.appendChild(elm);

        resetMeasures();
        elm.value = 1;

        await Promise.resolve();
        expectMeasureEquals(expected);
    });
}

function testNestedTree(expected) {
    it('captures component nested component tree', () => {
        const elm = createElement('c-parent', { is: Parent });
        document.body.appendChild(elm);

        expectMeasureEquals(expected);
    });
}

function testNestedRerender(expected) {
    it('captures component nested component tree rerender', async () => {
        const elm = createElement('c-parent', { is: Parent });
        document.body.appendChild(elm);

        resetMeasures();
        elm.value = 1;

        await Promise.resolve();
        expectMeasureEquals(expected);
    });
}

function testLifecycleHooks(expected) {
    it('should capture all the component lifecycle hooks', () => {
        const elm = createElement('c-lifecycle', { is: Lifecycle });
        document.body.appendChild(elm);
        document.body.removeChild(elm);

        expectMeasureEquals(expected);
    });
}

function testNestedComponentCreation(expected) {
    it('should support nested component creation', () => {
        const elm = createElement('c-nested', { is: Nested });
        document.body.appendChild(elm);

        expectMeasureEquals(expected);
    });
}

// Timings are not enabled in prod mode
describe.runIf(isUserTimingSupported && process.env.NODE_ENV !== 'production')(
    'performance timing',
    () => {
        beforeEach(() => {
            patchUserTiming();
            resetMeasures();
        });

        afterEach(() => {
            resetUserTiming();
        });

        describe.runIf(process.env.NODE_ENV === 'production')('production mode', () => {
            testConstructor([
                {
                    label: /lwc-render/,
                },
            ]);

            testRerender([
                {
                    label: /lwc-rerender/,
                },
            ]);

            testNestedTree([
                {
                    label: /lwc-render/,
                },
            ]);

            testNestedRerender([
                {
                    label: /lwc-rerender/,
                },
            ]);

            testLifecycleHooks([
                {
                    label: /lwc-render/,
                },
            ]);

            testNestedComponentCreation([
                {
                    label: /lwc-render/,
                    children: [
                        {
                            label: /lwc-render/,
                        },
                    ],
                },
            ]);
        });

        describe.skipIf(process.env.NODE_ENV === 'production')('development mode', () => {
            testConstructor([
                {
                    label: /<c-child> - constructor/,
                },
                {
                    label: /lwc-render/,
                    children: [
                        {
                            label: /<c-child> - render/,
                        },
                        {
                            label: /<c-child> - patch/,
                        },
                    ],
                },
            ]);

            testRerender([
                {
                    label: /lwc-rerender/,
                    children: [
                        {
                            label: /<c-child> - render/,
                        },
                        {
                            label: /<c-child> - patch/,
                        },
                    ],
                },
            ]);

            // Timing is slightly different with native custom element lifecycle callbacks
            testNestedTree(
                !lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
                    ? [
                          { label: '<c-parent> - constructor', children: [] },
                          {
                              label: 'lwc-render',
                              children: [
                                  { label: '<c-parent> - render', children: [] },
                                  {
                                      label: '<c-parent> - patch',
                                      children: [
                                          { label: '<c-child> - constructor', children: [] },
                                          {
                                              label: 'lwc-render',
                                              children: [
                                                  { label: '<c-child> - render', children: [] },
                                                  { label: '<c-child> - patch', children: [] },
                                              ],
                                          },
                                          { label: '<c-child> - constructor', children: [] },
                                          {
                                              label: 'lwc-render',
                                              children: [
                                                  { label: '<c-child> - render', children: [] },
                                                  { label: '<c-child> - patch', children: [] },
                                              ],
                                          },
                                      ],
                                  },
                              ],
                          },
                      ]
                    : [
                          {
                              label: /<c-parent> - constructor/,
                          },
                          {
                              label: /lwc-render/,
                              children: [
                                  {
                                      label: /<c-parent> - render/,
                                  },
                                  {
                                      label: /<c-parent> - patch/,
                                      children: [
                                          {
                                              label: /<c-child> - constructor/,
                                          },
                                          {
                                              label: /<c-child> - render/,
                                          },
                                          {
                                              label: /<c-child> - patch/,
                                          },
                                          {
                                              label: /<c-child> - constructor/,
                                          },
                                          {
                                              label: /<c-child> - render/,
                                          },
                                          {
                                              label: /<c-child> - patch/,
                                          },
                                      ],
                                  },
                              ],
                          },
                      ]
            );

            testNestedRerender([
                {
                    label: /lwc-rerender/,
                    children: [
                        {
                            label: /<c-parent> - render/,
                        },
                        {
                            label: /<c-parent> - patch/,
                            children: [
                                {
                                    label: /<c-child> - render/,
                                },
                                {
                                    label: /<c-child> - patch/,
                                },
                                {
                                    label: /<c-child> - render/,
                                },
                                {
                                    label: /<c-child> - patch/,
                                },
                            ],
                        },
                    ],
                },
            ]);

            testLifecycleHooks([
                {
                    label: /<c-lifecycle> - constructor/,
                },
                {
                    label: /lwc-render/,
                    children: [
                        {
                            label: /<c-lifecycle> - connectedCallback/,
                        },
                        {
                            label: /<c-lifecycle> - render/,
                        },
                        {
                            label: /<c-lifecycle> - patch/,
                        },
                        {
                            label: /<c-lifecycle> - renderedCallback/,
                        },
                    ],
                },
                {
                    label: /<c-lifecycle> - disconnectedCallback/,
                },
            ]);

            testNestedComponentCreation([
                {
                    label: /<c-nested> - constructor/,
                },
                {
                    label: /lwc-render/,
                    children: [
                        {
                            label: /<c-nested> - render/,
                        },
                        {
                            label: /<c-nested> - renderedCallback/,
                            children: [
                                {
                                    label: /<c-child> - constructor/,
                                },
                                {
                                    label: /lwc-render/,
                                    children: [
                                        {
                                            label: /<c-child> - render/,
                                        },
                                        {
                                            label: /<c-child> - patch/,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ]);
        });
    }
);
