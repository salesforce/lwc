import { createElement } from 'lwc';
import Child from 'x/child';
import Parent from 'x/parent';
import Lifecycle from 'x/lifecycle';
import Nested from 'x/nested';

import {
    isUserTimingSupported,
    patchUserTiming,
    resetUserTiming,
    resetMeasures,
    expectMeasureEquals,
} from './user-timing-utils';

function testConstructor(expected) {
    it('captures component constructor', () => {
        const elm = createElement('x-child', { is: Child });
        document.body.appendChild(elm);
        expectMeasureEquals(expected);
    });
}

function testRerender(expected) {
    it('component rerender', () => {
        const elm = createElement('x-child', { is: Child });
        document.body.appendChild(elm);

        resetMeasures();
        elm.value = 1;

        return Promise.resolve().then(() => {
            expectMeasureEquals(expected);
        });
    });
}

function testNestedTree(expected) {
    it('captures component nested component tree', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);

        expectMeasureEquals(expected);
    });
}

function testNestedRerender(expected) {
    it('captures component nested component tree rerender', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);

        resetMeasures();
        elm.value = 1;

        return Promise.resolve().then(() => {
            expectMeasureEquals(expected);
        });
    });
}

function testLifecycleHooks(expected) {
    it('should capture all the component lifecycle hooks', () => {
        const elm = createElement('x-lifecycle', { is: Lifecycle });
        document.body.appendChild(elm);
        document.body.removeChild(elm);

        expectMeasureEquals(expected);
    });
}

function testNestedComponentCreation(expected) {
    it('should support nested component creation', () => {
        const elm = createElement('x-nested', { is: Nested });
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
                    label: /<x-child> - constructor/,
                },
                {
                    label: /lwc-render/,
                    children: [
                        {
                            label: /<x-child> - render/,
                        },
                        {
                            label: /<x-child> - patch/,
                        },
                    ],
                },
            ]);

            testRerender([
                {
                    label: /lwc-rerender/,
                    children: [
                        {
                            label: /<x-child> - render/,
                        },
                        {
                            label: /<x-child> - patch/,
                        },
                    ],
                },
            ]);

            // Timing is slightly different with native custom element lifecycle callbacks
            testNestedTree(
                !lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
                    ? [
                          { label: '<x-parent> - constructor', children: [] },
                          {
                              label: 'lwc-render',
                              children: [
                                  { label: '<x-parent> - render', children: [] },
                                  {
                                      label: '<x-parent> - patch',
                                      children: [
                                          { label: '<x-child> - constructor', children: [] },
                                          {
                                              label: 'lwc-render',
                                              children: [
                                                  { label: '<x-child> - render', children: [] },
                                                  { label: '<x-child> - patch', children: [] },
                                              ],
                                          },
                                          { label: '<x-child> - constructor', children: [] },
                                          {
                                              label: 'lwc-render',
                                              children: [
                                                  { label: '<x-child> - render', children: [] },
                                                  { label: '<x-child> - patch', children: [] },
                                              ],
                                          },
                                      ],
                                  },
                              ],
                          },
                      ]
                    : [
                          {
                              label: /<x-parent> - constructor/,
                          },
                          {
                              label: /lwc-render/,
                              children: [
                                  {
                                      label: /<x-parent> - render/,
                                  },
                                  {
                                      label: /<x-parent> - patch/,
                                      children: [
                                          {
                                              label: /<x-child> - constructor/,
                                          },
                                          {
                                              label: /<x-child> - render/,
                                          },
                                          {
                                              label: /<x-child> - patch/,
                                          },
                                          {
                                              label: /<x-child> - constructor/,
                                          },
                                          {
                                              label: /<x-child> - render/,
                                          },
                                          {
                                              label: /<x-child> - patch/,
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
                            label: /<x-parent> - render/,
                        },
                        {
                            label: /<x-parent> - patch/,
                            children: [
                                {
                                    label: /<x-child> - render/,
                                },
                                {
                                    label: /<x-child> - patch/,
                                },
                                {
                                    label: /<x-child> - render/,
                                },
                                {
                                    label: /<x-child> - patch/,
                                },
                            ],
                        },
                    ],
                },
            ]);

            testLifecycleHooks([
                {
                    label: /<x-lifecycle> - constructor/,
                },
                {
                    label: /lwc-render/,
                    children: [
                        {
                            label: /<x-lifecycle> - connectedCallback/,
                        },
                        {
                            label: /<x-lifecycle> - render/,
                        },
                        {
                            label: /<x-lifecycle> - patch/,
                        },
                        {
                            label: /<x-lifecycle> - renderedCallback/,
                        },
                    ],
                },
                {
                    label: /<x-lifecycle> - disconnectedCallback/,
                },
            ]);

            testNestedComponentCreation([
                {
                    label: /<x-nested> - constructor/,
                },
                {
                    label: /lwc-render/,
                    children: [
                        {
                            label: /<x-nested> - render/,
                        },
                        {
                            label: /<x-nested> - renderedCallback/,
                            children: [
                                {
                                    label: /<x-child> - constructor/,
                                },
                                {
                                    label: /lwc-render/,
                                    children: [
                                        {
                                            label: /<x-child> - render/,
                                        },
                                        {
                                            label: /<x-child> - patch/,
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
