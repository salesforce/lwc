import { createElement } from 'test-utils';

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

if (isUserTimingSupported) {
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
                label: /<x-child \(\d+\)> - constructor/,
            },
            {
                label: /lwc-hydrate/,
                children: [
                    {
                        label: /<x-child \(\d+\)> - render/,
                    },
                    {
                        label: /<x-child \(\d+\)> - patch/,
                    },
                ],
            },
        ]);

        testRehydration([
            {
                label: /lwc-rehydrate/,
                children: [
                    {
                        label: /<x-child \(\d+\)> - render/,
                    },
                    {
                        label: /<x-child \(\d+\)> - patch/,
                    },
                ],
            },
        ]);

        testNestedTree([
            {
                label: /<x-parent \(\d+\)> - constructor/,
            },
            {
                label: /lwc-hydrate/,
                children: [
                    {
                        label: /<x-parent \(\d+\)> - render/,
                    },
                    {
                        label: /<x-parent \(\d+\)> - patch/,
                        children: [
                            {
                                label: /<x-child \(\d+\)> - constructor/,
                            },
                            {
                                label: /<x-child \(\d+\)> - render/,
                            },
                            {
                                label: /<x-child \(\d+\)> - patch/,
                            },
                            {
                                label: /<x-child \(\d+\)> - constructor/,
                            },
                            {
                                label: /<x-child \(\d+\)> - render/,
                            },
                            {
                                label: /<x-child \(\d+\)> - patch/,
                            },
                        ],
                    },
                ],
            },
        ]);

        testNestedRehydration([
            {
                label: /lwc-rehydrate/,
                children: [
                    {
                        label: /<x-parent \(\d+\)> - render/,
                    },
                    {
                        label: /<x-parent \(\d+\)> - patch/,
                        children: [
                            {
                                label: /<x-child \(\d+\)> - render/,
                            },
                            {
                                label: /<x-child \(\d+\)> - patch/,
                            },
                            {
                                label: /<x-child \(\d+\)> - render/,
                            },
                            {
                                label: /<x-child \(\d+\)> - patch/,
                            },
                        ],
                    },
                ],
            },
        ]);

        testLifecycleHooks([
            {
                label: /<x-lifecycle \(\d+\)> - constructor/,
            },
            {
                label: /lwc-hydrate/,
                children: [
                    {
                        label: /<x-lifecycle \(\d+\)> - connectedCallback/,
                    },
                    {
                        label: /<x-lifecycle \(\d+\)> - render/,
                    },
                    {
                        label: /<x-lifecycle \(\d+\)> - patch/,
                    },
                    {
                        label: /<x-lifecycle \(\d+\)> - renderedCallback/,
                    },
                ],
            },
            {
                label: /<x-lifecycle \(\d+\)> - disconnectedCallback/,
            },
        ]);

        testNestedComponentCreation([
            {
                label: /<x-nested \(\d+\)> - constructor/,
            },
            {
                label: /lwc-hydrate/,
                children: [
                    {
                        label: /<x-nested \(\d+\)> - render/,
                    },
                    {
                        label: /<x-nested \(\d+\)> - renderedCallback/,
                        children: [
                            {
                                label: /<x-child \(\d+\)> - constructor/,
                            },
                            {
                                label: /lwc-hydrate/,
                                children: [
                                    {
                                        label: /<x-child \(\d+\)> - render/,
                                    },
                                    {
                                        label: /<x-child \(\d+\)> - patch/,
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
