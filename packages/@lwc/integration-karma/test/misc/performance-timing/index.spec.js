import { createElement } from 'lwc';
import { nativeCustomElementLifecycleEnabled } from 'test-utils';

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

function testRehydration(expected) {
    it('component rehydration', () => {
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

function testNestedRehydration(expected) {
    it('captures component nested component tree rehydration', () => {
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
if (isUserTimingSupported && process.env.NODE_ENV !== 'production') {
    beforeEach(() => {
        patchUserTiming();
        resetMeasures();
    });

    afterEach(() => {
        resetUserTiming();
    });

    if (process.env.NODE_ENV === 'production') {
        testConstructor([
            {
                label: /lwc-hydrate/,
            },
        ]);

        testRehydration([
            {
                label: /lwc-rehydrate/,
            },
        ]);

        testNestedTree([
            {
                label: /lwc-hydrate/,
            },
        ]);

        testNestedRehydration([
            {
                label: /lwc-rehydrate/,
            },
        ]);

        testLifecycleHooks([
            {
                label: /lwc-hydrate/,
            },
        ]);

        testNestedComponentCreation([
            {
                label: /lwc-hydrate/,
                children: [
                    {
                        label: /lwc-hydrate/,
                    },
                ],
            },
        ]);
    } else {
        testConstructor([
            {
                label: /<x-child> - constructor/,
            },
            {
                label: /lwc-hydrate/,
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

        testRehydration([
            {
                label: /lwc-rehydrate/,
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
            nativeCustomElementLifecycleEnabled
                ? [
                      { label: '<x-parent> - constructor', children: [] },
                      {
                          label: 'lwc-hydrate',
                          children: [
                              { label: '<x-parent> - render', children: [] },
                              {
                                  label: '<x-parent> - patch',
                                  children: [
                                      { label: '<x-child> - constructor', children: [] },
                                      {
                                          label: 'lwc-hydrate',
                                          children: [
                                              { label: '<x-child> - render', children: [] },
                                              { label: '<x-child> - patch', children: [] },
                                          ],
                                      },
                                      { label: '<x-child> - constructor', children: [] },
                                      {
                                          label: 'lwc-hydrate',
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
                          label: /lwc-hydrate/,
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

        testNestedRehydration([
            {
                label: /lwc-rehydrate/,
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
                label: /lwc-hydrate/,
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
                label: /lwc-hydrate/,
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
                                label: /lwc-hydrate/,
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
    }
}
