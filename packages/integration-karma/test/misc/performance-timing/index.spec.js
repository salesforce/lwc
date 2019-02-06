import { createElement } from 'test-utils';

import Child from 'x/child';
import Parent from 'x/parent';
import Lifecycle from 'x/lifecycle';
import Nested from 'x/nested';

import {
    isUserTimingSupported,
    setupPerformanceObserver,
    teardownPerformanceObserver,
    resetMeasures,
    expectMeasureEquals
} from './user-timing-utils';

if (isUserTimingSupported) {
    beforeEach(() => {
        setupPerformanceObserver();
        resetMeasures();
    });

    afterEach(() => {
        teardownPerformanceObserver();
    });

    it('captures component constructor', () => {
        const elm = createElement('x-child', { is: Child });
        document.body.appendChild(elm);

        expectMeasureEquals([{
            label: /<x-child \(\d+\)> - constructor/,
        }, {
            label: /lwc-hydrate/,
            children: [{
                label: /<x-child \(\d+\)> - render/,
            }, {
                label: /<x-child \(\d+\)> - patch/,
            }],
        }]);
    });

    it('component rehydration', () => {
        const elm = createElement('x-child', { is: Child });
        document.body.appendChild(elm);

        resetMeasures();
        elm.value = 1;

        return Promise.resolve().then(() => {
            expectMeasureEquals([{
                label: /lwc-rehydrate/,
                children: [{
                    label: /<x-child \(\d+\)> - render/,
                }, {
                    label: /<x-child \(\d+\)> - patch/,
                }],
            }]);
        });
    });

    it('captures component nested component tree', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);

        expectMeasureEquals([{
            label: /<x-parent \(\d+\)> - constructor/,
        }, {
            label: /lwc-hydrate/,
            children: [{
                label: /<x-parent \(\d+\)> - render/,
            }, {
                label: /<x-parent \(\d+\)> - patch/,
                children: [{
                    label: /<x-child \(\d+\)> - constructor/,
                }, {
                    label: /<x-child \(\d+\)> - render/,
                }, {
                    label: /<x-child \(\d+\)> - patch/,
                }, {
                    label: /<x-child \(\d+\)> - constructor/,
                }, {
                    label: /<x-child \(\d+\)> - render/,
                }, {
                    label: /<x-child \(\d+\)> - patch/,
                }],
            }],
        }]);
    });

    it('captures component nested component tree rehydration', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);

        resetMeasures();
        elm.value = 1;

        return Promise.resolve().then(() => {
            expectMeasureEquals([{
                label: /lwc-rehydrate/,
                children: [{
                    label: /<x-parent \(\d+\)> - render/,
                }, {
                    label: /<x-parent \(\d+\)> - patch/,
                    children: [{
                        label: /<x-child \(\d+\)> - render/,
                    }, {
                        label: /<x-child \(\d+\)> - patch/,
                    }, {
                        label: /<x-child \(\d+\)> - render/,
                    }, {
                        label: /<x-child \(\d+\)> - patch/,
                    }]
                }],
            }]);
        });
    });

    it('should capture all the component lifecycle hooks', () => {
        const elm = createElement('x-lifecycle', { is: Lifecycle });
        document.body.appendChild(elm);
        document.body.removeChild(elm);

        expectMeasureEquals([{
            label: /<x-lifecycle \(\d+\)> - constructor/,
        }, {
            label: /lwc-hydrate/,
            children: [{
                label: /<x-lifecycle \(\d+\)> - connectedCallback/,
            },{
                label: /<x-lifecycle \(\d+\)> - render/,
            }, {
                label: /<x-lifecycle \(\d+\)> - patch/,
            }, {
                label: /<x-lifecycle \(\d+\)> - renderedCallback/,
            }],
        }, {
            label: /<x-lifecycle \(\d+\)> - disconnectedCallback/,
        }]);
    });

    fit('should support nested component creation', () => {
        const elm = createElement('x-nested', { is: Nested });
        document.body.appendChild(elm);

        // expectMeasureEquals([{
        //     label: /<x-lifecycle \(\d+\)> - constructor/,
        // }, {
        //     label: /lwc-hydrate/,
        //     children: [{
        //         label: /<x-lifecycle \(\d+\)> - connectedCallback/,
        //     },{
        //         label: /<x-lifecycle \(\d+\)> - render/,
        //     }, {
        //         label: /<x-lifecycle \(\d+\)> - patch/,
        //     }, {
        //         label: /<x-lifecycle \(\d+\)> - renderedCallback/,
        //     }],
        // }, {
        //     label: /<x-lifecycle \(\d+\)> - disconnectedCallback/,
        // }]);
    });
}
