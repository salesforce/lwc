import { createElement } from 'lwc';
import { ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE } from 'test-utils';

import Single from 'x/single';
import Parent from 'x/parent';
import ParentIf from 'x/parentIf';
import ParentProp from 'x/parentProp';
import Container from 'invocationorder/container';
import LightContainer from 'invocationorder/lightContainer';
import DispatchEvents from 'x/dispatchEvents';
import TimingParent from 'timing/parent';
import TimingParentLight from 'timing/parentLight';
import ReorderingList from 'reordering/list';
import ReorderingListLight from 'reordering/listLight';

function resetTimingBuffer() {
    window.timingBuffer = [];
}

beforeEach(() => {
    resetTimingBuffer();
});

afterEach(() => {
    delete window.timingBuffer;
});

it('should only invoke constructor when the component is created', () => {
    createElement('x-single', { is: Single });
    expect(window.timingBuffer).toEqual(['single:constructor']);
});

it('should invoke all the lifecycle callback synchronously when the element is appended in the DOM', () => {
    const elm = createElement('x-single', { is: Single });

    resetTimingBuffer();
    document.body.appendChild(elm);

    expect(window.timingBuffer).toEqual(['single:connectedCallback', 'single:renderedCallback']);
});

it('should the disconnectedCallback synchronously when removing the element from the DOM', () => {
    const elm = createElement('x-single', { is: Single });
    document.body.appendChild(elm);

    resetTimingBuffer();
    document.body.removeChild(elm);

    expect(window.timingBuffer).toEqual(['single:disconnectedCallback']);
});

it('should invoke the component lifecycle hooks in the right order when appending in the parent in the DOM', () => {
    const elm = createElement('x-parent', { is: Parent });

    resetTimingBuffer();
    document.body.appendChild(elm);

    expect(window.timingBuffer).toEqual([
        'parent:connectedCallback',
        'child:constructor',
        'child:connectedCallback',
        'child:renderedCallback',
        'child:constructor',
        'child:connectedCallback',
        'child:renderedCallback',
        'parent:renderedCallback',
    ]);
});

it('should invoke the component lifecycle hooks in the right order when removing the parent from the DOM', () => {
    const elm = createElement('x-parent', { is: Parent });
    document.body.appendChild(elm);

    resetTimingBuffer();
    document.body.removeChild(elm);

    expect(window.timingBuffer).toEqual([
        'parent:disconnectedCallback',
        'child:disconnectedCallback',
        'child:disconnectedCallback',
    ]);
});

it('should call children component lifecycle hooks when rendered dynamically via the template', () => {
    const elm = createElement('x-parent-if', { is: ParentIf });
    document.body.appendChild(elm);

    expect(window.timingBuffer).toEqual([
        'parentIf:connectedCallback',
        'parentIf:renderedCallback',
    ]);

    resetTimingBuffer();
    elm.childVisible = true;

    return Promise.resolve()
        .then(() => {
            expect(window.timingBuffer).toEqual([
                'child:constructor',
                'child:connectedCallback',
                'child:renderedCallback',
                'parentIf:renderedCallback',
            ]);

            resetTimingBuffer();
            elm.childVisible = false;
        })
        .then(() => {
            expect(window.timingBuffer).toEqual([
                'child:disconnectedCallback',
                'parentIf:renderedCallback',
            ]);
        });
});

it('should call children component lifecycle hooks when a public property change', () => {
    const elm = createElement('x-parent-prop', { is: ParentProp });
    document.body.appendChild(elm);

    expect(window.timingBuffer).toEqual([
        'parentProp:connectedCallback',
        'child:constructor',
        'child:connectedCallback',
        'child:renderedCallback',
        'parentProp:renderedCallback',
    ]);

    resetTimingBuffer();
    elm.value = 'bar';

    return Promise.resolve().then(() => {
        expect(window.timingBuffer).toEqual([
            'child:renderedCallback',
            'parentProp:renderedCallback',
        ]);

        resetTimingBuffer();
        elm.childVisible = false;
    });
});

describe('invocation order', () => {
    const scenarios = [
        {
            testName: 'shadow',
            Ctor: Container,
            tagName: 'invocationorder-container',
        },
        {
            testName: 'light',
            Ctor: LightContainer,
            tagName: 'invocationorder-light-container',
        },
    ];

    scenarios.forEach(({ testName, Ctor, tagName }) => {
        describe(testName, () => {
            /*
            The exact invocation order is not important so it's ok that native and synthetic have different
            orderings. For any given component, the invariants are:

            1) connectedCallback is invoked after the parent connectedCallback (top-down)
            2) renderedCallback is invoked before the parent renderedCallback (bottom-up)
            3) renderedCallback is invoked after connectedCallback

            It's ok to update the orderings below after a refactor, as long as these invariants hold!
            */
            it('should invoke connectedCallback and renderedCallback in the expected order', () => {
                const elm = createElement(tagName, { is: Ctor });
                document.body.appendChild(elm);

                let expected;
                if (testName === 'shadow' && process.env.NATIVE_SHADOW) {
                    if (ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE) {
                        expected = [
                            'foo-a:connectedCallback',
                            'foo-internal-a:connectedCallback',
                            'foo-internal-a:renderedCallback',
                            'foo-a:renderedCallback',
                            'foo-b:connectedCallback',
                            'foo-internal-b:connectedCallback',
                            'foo-internal-b:renderedCallback',
                            'foo-b:renderedCallback',
                            'foo-c:connectedCallback',
                            'foo-internal-c:connectedCallback',
                            'foo-internal-c:renderedCallback',
                            'foo-c:renderedCallback',
                            'foo-d:connectedCallback',
                            'foo-internal-d:connectedCallback',
                            'foo-internal-d:renderedCallback',
                            'foo-d:renderedCallback',
                            'foo-e:connectedCallback',
                            'foo-internal-e:connectedCallback',
                            'foo-internal-e:renderedCallback',
                            'foo-e:renderedCallback',
                        ];
                    } else {
                        expected = [
                            'foo-a:connectedCallback',
                            'foo-b:connectedCallback',
                            'foo-c:connectedCallback',
                            'foo-internal-c:connectedCallback',
                            'foo-internal-c:renderedCallback',
                            'foo-c:renderedCallback',
                            'foo-internal-b:connectedCallback',
                            'foo-internal-b:renderedCallback',
                            'foo-b:renderedCallback',
                            'foo-d:connectedCallback',
                            'foo-internal-d:connectedCallback',
                            'foo-internal-d:renderedCallback',
                            'foo-d:renderedCallback',
                            'foo-internal-a:connectedCallback',
                            'foo-internal-a:renderedCallback',
                            'foo-a:renderedCallback',
                            'foo-e:connectedCallback',
                            'foo-internal-e:connectedCallback',
                            'foo-internal-e:renderedCallback',
                            'foo-e:renderedCallback',
                        ];
                    }
                } else {
                    // synthetic shadow or light DOM
                    expected = [
                        'foo-a:connectedCallback',
                        'foo-internal-a:connectedCallback',
                        'foo-internal-a:renderedCallback',
                        'foo-b:connectedCallback',
                        'foo-internal-b:connectedCallback',
                        'foo-internal-b:renderedCallback',
                        'foo-c:connectedCallback',
                        'foo-internal-c:connectedCallback',
                        'foo-internal-c:renderedCallback',
                        'foo-c:renderedCallback',
                        'foo-b:renderedCallback',
                        'foo-d:connectedCallback',
                        'foo-internal-d:connectedCallback',
                        'foo-internal-d:renderedCallback',
                        'foo-d:renderedCallback',
                        'foo-a:renderedCallback',
                        'foo-e:connectedCallback',
                        'foo-internal-e:connectedCallback',
                        'foo-internal-e:renderedCallback',
                        'foo-e:renderedCallback',
                    ];
                }

                expect(window.timingBuffer).toEqual(expected);
            });

            it(`should invoke disconnectedCallback in the expected order`, () => {
                const elm = createElement('order-container', { is: Container });
                document.body.appendChild(elm);

                resetTimingBuffer();
                document.body.removeChild(elm);

                const expected = [
                    'foo-e:disconnectedCallback',
                    'foo-internal-e:disconnectedCallback',
                    'foo-a:disconnectedCallback',
                    'foo-internal-a:disconnectedCallback',
                    'foo-b:disconnectedCallback',
                    'foo-internal-b:disconnectedCallback',
                    'foo-c:disconnectedCallback',
                    'foo-internal-c:disconnectedCallback',
                    'foo-d:disconnectedCallback',
                    'foo-internal-d:disconnectedCallback',
                ];

                expect(window.timingBuffer).toEqual(expected);
            });
        });
    });
});

describe('connectedCallback/renderedCallback timing when reconnected', () => {
    const scenarios = [
        {
            testName: 'shadow',
            tagName: 'timing-parent',
            Ctor: TimingParent,
        },
        {
            testName: 'light',
            tagName: 'timing-parent-light',
            Ctor: TimingParentLight,
        },
    ];

    scenarios.forEach(({ testName, tagName, Ctor }) => {
        describe(testName, () => {
            it('connect/disconnect/reconnect', async () => {
                const elm = createElement(tagName, { is: Ctor });
                document.body.appendChild(elm);
                document.body.removeChild(elm);

                await Promise.resolve();
                resetTimingBuffer();

                document.body.appendChild(elm);
                // TODO [#4057]: the child's renderedCallback should probably fire here if the parent's does
                expect(window.timingBuffer).toEqual(
                    ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
                        ? [
                              'parent:connectedCallback',
                              'parent:renderedCallback',
                              'child:connectedCallback',
                          ]
                        : ['parent:connectedCallback', 'parent:renderedCallback']
                );
            });

            it('connect/mutate/disconnect/reconnect', async () => {
                const elm = createElement(tagName, { is: Ctor });
                document.body.appendChild(elm);
                elm.value = 'baz';
                document.body.removeChild(elm);

                await Promise.resolve();
                resetTimingBuffer();

                document.body.appendChild(elm);
                expect(window.timingBuffer).toEqual(
                    ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
                        ? ['parent:connectedCallback', 'child:connectedCallback']
                        : ['parent:connectedCallback']
                );
            });
        });
    });
});

describe('timing when reordering a list', () => {
    const scenarios = [
        {
            testName: 'shadow',
            tagName: 'reordering-list',
            Ctor: ReorderingList,
        },
        {
            testName: 'light',
            tagName: 'reordering-list-light',
            Ctor: ReorderingListLight,
        },
    ];
    scenarios.forEach(({ testName, tagName, Ctor }) => {
        describe(testName, () => {
            it('invokes the expected callbacks when reordering', async () => {
                const elm = createElement(tagName, { is: Ctor });
                elm.uids = [1, 2];
                document.body.appendChild(elm);

                await Promise.resolve();
                resetTimingBuffer();

                elm.uids = [2, 1];
                await Promise.resolve();

                expect(window.timingBuffer).toEqual(
                    // TODO [#4057]: the child's renderedCallback should probably fire here if the parent's does
                    ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
                        ? [
                              'item-wrapper-1:disconnectedCallback',
                              'item-1:disconnectedCallback',
                              'item-wrapper-1:connectedCallback',
                              'item-wrapper-1:renderedCallback',
                              'item-1:connectedCallback',
                          ]
                        : []
                );
            });
        });
    });
});

describe('dispatchEvent from connectedCallback/disconnectedCallback', () => {
    // global events behave differently due to element being disconnected from the DOM
    let globalConnected;
    let globalDisconnected;

    const onConnected = () => {
        globalConnected = true;
    };

    const onDisconnected = () => {
        globalDisconnected = true;
    };

    beforeEach(() => {
        globalConnected = false;
        globalDisconnected = false;
        document.addEventListener('customconnected', onConnected);
        document.addEventListener('customdisconnected', onDisconnected);
    });

    afterEach(() => {
        document.removeEventListener('customconnected', onConnected);
        document.removeEventListener('customdisconnected', onDisconnected);
    });

    it('behaves the same regardless of native/synthetic lifecycle', () => {
        const elm = createElement('x-dispatch-events', { is: DispatchEvents });

        let connected = false;
        let disconnected = false;

        elm.addEventListener('customconnected', () => {
            connected = true;
        });
        elm.addEventListener('customdisconnected', () => {
            disconnected = true;
        });

        document.body.appendChild(elm);
        expect(connected).toBe(true); // received synchronously
        expect(disconnected).toBe(false);
        expect(globalConnected).toBe(true); // received synchronously
        expect(globalDisconnected).toBe(false);

        document.body.removeChild(elm);
        expect(connected).toBe(true);
        expect(disconnected).toBe(true); // received synchronously
        expect(globalConnected).toBe(true);
        expect(globalDisconnected).toBe(false); // never received due to disconnection
    });
});
