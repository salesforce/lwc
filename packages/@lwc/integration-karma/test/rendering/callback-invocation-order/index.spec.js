import { createElement } from 'lwc';
import { nativeCustomElementLifecycleEnabled } from 'test-utils';

import ShadowParent from 'x/shadowParent';
import ShadowLightParent from 'x/shadowLightParent';
import LightParent from 'x/lightParent';
import LightShadowParent from 'x/lightShadowParent';
import ToggleContainer from 'x/toggleContainer';
import MultiTemplateConditionals from 'x/multiTemplateConditionals';
import ShadowContainerMultipleConditionals from 'x/shadowContainerMultipleConditionals';
import LightContainerMultipleConditionals from 'x/lightContainerMultipleConditionals';

function resetTimingBuffer() {
    window.timingBuffer = [];
}

beforeEach(() => {
    resetTimingBuffer();
});

const fixtures = [
    {
        tagName: 'x-shadow-parent',
        ctor: ShadowParent,
        connect: process.env.NATIVE_SHADOW
            ? nativeCustomElementLifecycleEnabled
                ? [
                      'shadowParent:connectedCallback',
                      'leaf:before-container:connectedCallback',
                      'shadowContainer:connectedCallback',
                      'leaf:before-slot:connectedCallback',
                      'leaf:after-slot:connectedCallback',
                      'leaf:slotted-a:connectedCallback',
                      'leaf:slotted-b:connectedCallback',
                      'leaf:after-container:connectedCallback',
                  ]
                : [
                      'shadowParent:connectedCallback',
                      'leaf:before-container:connectedCallback',
                      'shadowContainer:connectedCallback',
                      'leaf:slotted-a:connectedCallback',
                      'leaf:slotted-b:connectedCallback',
                      'leaf:before-slot:connectedCallback',
                      'leaf:after-slot:connectedCallback',
                      'leaf:after-container:connectedCallback',
                  ]
            : [
                  'shadowParent:connectedCallback',
                  'leaf:before-container:connectedCallback',
                  'shadowContainer:connectedCallback',
                  'leaf:before-slot:connectedCallback',
                  'leaf:slotted-a:connectedCallback',
                  'leaf:slotted-b:connectedCallback',
                  'leaf:after-slot:connectedCallback',
                  'leaf:after-container:connectedCallback',
              ],
        disconnect: [
            'shadowParent:disconnectedCallback',
            'leaf:after-container:disconnectedCallback',
            'shadowContainer:disconnectedCallback',
            'leaf:after-slot:disconnectedCallback',
            'leaf:before-slot:disconnectedCallback',
            'leaf:slotted-a:disconnectedCallback',
            'leaf:slotted-b:disconnectedCallback',
            'leaf:before-container:disconnectedCallback',
        ],
    },
    {
        tagName: 'x-shadow-light-parent',
        ctor: ShadowLightParent,
        connect: process.env.NATIVE_SHADOW
            ? [
                  'shadowLightParent:connectedCallback',
                  'lightContainer:connectedCallback',
                  'leaf:before-slot:connectedCallback',
                  'leaf:slotted-shadow:connectedCallback',
                  'leaf:after-slot:connectedCallback',
              ]
            : [
                  'shadowLightParent:connectedCallback',
                  'lightContainer:connectedCallback',
                  'leaf:before-slot:connectedCallback',
                  'leaf:slotted-shadow:connectedCallback',
                  'leaf:after-slot:connectedCallback',
              ],
        disconnect: [
            'shadowLightParent:disconnectedCallback',
            'lightContainer:disconnectedCallback',
            'leaf:after-slot:disconnectedCallback',
            'leaf:before-slot:disconnectedCallback',
            'leaf:slotted-shadow:disconnectedCallback',
        ],
    },
    {
        tagName: 'x-light-parent',
        ctor: LightParent,
        connect: [
            'lightParent:connectedCallback',
            'leaf:before-container:connectedCallback',
            'lightContainer:connectedCallback',
            'leaf:before-slot:connectedCallback',
            'leaf:slotted-a:connectedCallback',
            'leaf:slotted-b:connectedCallback',
            'leaf:after-slot:connectedCallback',
            'leaf:after-container:connectedCallback',
        ],
        disconnect: [
            'lightParent:disconnectedCallback',
            'leaf:after-container:disconnectedCallback',
            'lightContainer:disconnectedCallback',
            'leaf:after-slot:disconnectedCallback',
            'leaf:before-slot:disconnectedCallback',
            'leaf:slotted-a:disconnectedCallback',
            'leaf:slotted-b:disconnectedCallback',
            'leaf:before-container:disconnectedCallback',
        ],
    },
    {
        tagName: 'x-light-shadow-parent',
        ctor: LightShadowParent,
        connect: process.env.NATIVE_SHADOW
            ? nativeCustomElementLifecycleEnabled
                ? [
                      'lightShadowContainer:connectedCallback',
                      'shadowContainer:connectedCallback',
                      'leaf:before-slot:connectedCallback',
                      'leaf:after-slot:connectedCallback',
                      'leaf:slotted-light:connectedCallback',
                  ]
                : [
                      'lightShadowContainer:connectedCallback',
                      'shadowContainer:connectedCallback',
                      'leaf:slotted-light:connectedCallback',
                      'leaf:before-slot:connectedCallback',
                      'leaf:after-slot:connectedCallback',
                  ]
            : [
                  'lightShadowContainer:connectedCallback',
                  'shadowContainer:connectedCallback',
                  'leaf:before-slot:connectedCallback',
                  'leaf:slotted-light:connectedCallback',
                  'leaf:after-slot:connectedCallback',
              ],
        disconnect: [
            'lightShadowContainer:disconnectedCallback',
            'shadowContainer:disconnectedCallback',
            'leaf:after-slot:disconnectedCallback',
            'leaf:before-slot:disconnectedCallback',
            'leaf:slotted-light:disconnectedCallback',
        ],
    },
];

for (const { tagName, ctor, connect, disconnect } of fixtures) {
    it(`${tagName} - should invoke callbacks in the right order`, () => {
        const elm = createElement(tagName, { is: ctor });

        document.body.appendChild(elm);
        expect(window.timingBuffer).toEqual(connect);

        resetTimingBuffer();

        document.body.removeChild(elm);
        expect(window.timingBuffer).toEqual(disconnect);
    });
}

it('should invoke callbacks on the right order (issue #1199 and #1198)', () => {
    const elm = createElement('x-toggle-container', { is: ToggleContainer });

    document.body.appendChild(elm);
    expect(window.timingBuffer).toEqual(
        process.env.NATIVE_SHADOW
            ? nativeCustomElementLifecycleEnabled
                ? [
                      'shadowContainer:connectedCallback',
                      'leaf:before-slot:connectedCallback',
                      'leaf:after-slot:connectedCallback',
                      'parent:a:connectedCallback',
                      'leaf:a:connectedCallback',
                      'parent:b:connectedCallback',
                      'leaf:b:connectedCallback',
                  ]
                : [
                      'shadowContainer:connectedCallback',
                      'parent:a:connectedCallback',
                      'leaf:a:connectedCallback',
                      'parent:b:connectedCallback',
                      'leaf:b:connectedCallback',
                      'leaf:before-slot:connectedCallback',
                      'leaf:after-slot:connectedCallback',
                  ]
            : [
                  'shadowContainer:connectedCallback',
                  'leaf:before-slot:connectedCallback',
                  'parent:a:connectedCallback',
                  'leaf:a:connectedCallback',
                  'parent:b:connectedCallback',
                  'leaf:b:connectedCallback',
                  'leaf:after-slot:connectedCallback',
              ]
    );

    resetTimingBuffer();

    elm.hide = true;
    return Promise.resolve().then(() => {
        expect(window.timingBuffer).toEqual(
            nativeCustomElementLifecycleEnabled
                ? [
                      'shadowContainer:disconnectedCallback',
                      'leaf:after-slot:disconnectedCallback',
                      'leaf:before-slot:disconnectedCallback',
                      'parent:a:disconnectedCallback',
                      'leaf:a:disconnectedCallback',
                      'parent:b:disconnectedCallback',
                      'leaf:b:disconnectedCallback',
                  ]
                : [
                      'shadowContainer:disconnectedCallback',
                      'leaf:after-slot:disconnectedCallback',
                      'leaf:before-slot:disconnectedCallback',
                      'parent:a:disconnectedCallback',
                      'leaf:a:disconnectedCallback',
                      'parent:b:disconnectedCallback',
                      'leaf:b:disconnectedCallback',
                  ]
        );
    });
});

it('should invoke callbacks on the right order when multiple templates are used with lwc:if', () => {
    const elm = createElement('x-multi-template-conditionals', { is: MultiTemplateConditionals });
    elm.show = true;
    document.body.appendChild(elm);

    // initial load is x-shadow-parent
    expect(window.timingBuffer).toEqual([
        'leaf:T1-1:connectedCallback',
        'leaf:T1-2:connectedCallback',
        'leaf:T1-3:connectedCallback',
        'leaf:T1-4:connectedCallback',
        'leaf:T1-5:connectedCallback',
        'leaf:T1-6:connectedCallback',
    ]);

    resetTimingBuffer();
    elm.next();

    return Promise.resolve()
        .then(() => {
            // disconnect x-shadow-parent +
            // connect x-shadow-container with 2 parents, 'a' and 'b'
            expect(window.timingBuffer).toEqual(
                nativeCustomElementLifecycleEnabled
                    ? [
                          'leaf:T1-1:disconnectedCallback',
                          'leaf:T1-2:disconnectedCallback',
                          'leaf:T1-3:disconnectedCallback',
                          'leaf:T1-4:disconnectedCallback',
                          'leaf:T1-5:disconnectedCallback',
                          'leaf:T1-6:disconnectedCallback',
                          'leaf:T2-1:connectedCallback',
                          'leaf:T2-2:connectedCallback',
                          'leaf:T2-3:connectedCallback',
                          'leaf:T2-4:connectedCallback',
                          'leaf:T2-5:connectedCallback',
                          'leaf:T2-6:connectedCallback',
                      ]
                    : [
                          'leaf:T1-6:disconnectedCallback',
                          'leaf:T1-5:disconnectedCallback',
                          'leaf:T1-4:disconnectedCallback',
                          'leaf:T1-3:disconnectedCallback',
                          'leaf:T1-2:disconnectedCallback',
                          'leaf:T1-1:disconnectedCallback',
                          'leaf:T2-1:connectedCallback',
                          'leaf:T2-2:connectedCallback',
                          'leaf:T2-3:connectedCallback',
                          'leaf:T2-4:connectedCallback',
                          'leaf:T2-5:connectedCallback',
                          'leaf:T2-6:connectedCallback',
                      ]
            );
            resetTimingBuffer();
            elm.show = false;
        })
        .then(() => {
            expect(window.timingBuffer).toEqual([
                'leaf:T2-1:disconnectedCallback',
                'leaf:T2-2:disconnectedCallback',
                'leaf:T2-3:disconnectedCallback',
                'leaf:T2-4:disconnectedCallback',
                'leaf:T2-5:disconnectedCallback',
                'leaf:T2-6:disconnectedCallback',
            ]);
        });
});

describe('regression test (#3827)', () => {
    let originalOnError;
    function onError(event) {
        event.preventDefault(); // don't log the error
    }

    beforeEach(() => {
        // These error handlers are here to capture errors thrown in synthetic shadow mode
        // after the rerendering happens.
        window.onerror;
        window.onerror = null;
        window.addEventListener('error', onError);
    });

    afterEach(() => {
        window.onerror = originalOnError;
        window.removeEventListener('error', onError);
    });

    const fixtures = [
        {
            fixtureName: 'shadow DOM',
            tagName: 'x-shadow-container-multiple-conditionals',
            ctor: ShadowContainerMultipleConditionals,
            elseBlock: (currentLeafName) => [
                'shadowContainer:connectedCallback',
                'shadowSlot:connectedCallback',
                `leaf:${currentLeafName}:connectedCallback`,
            ],
            ifBlock: (currentLeafName, previousLeafName) =>
                process.env.NATIVE_SHADOW
                    ? []
                    : nativeCustomElementLifecycleEnabled
                    ? [
                          `leaf:${currentLeafName}:connectedCallback`,
                          `leaf:${previousLeafName}:disconnectedCallback`,
                      ]
                    : [`leaf:${currentLeafName}:connectedCallback`],
            elseIfBlock: (currentLeafName, previousLeafName) =>
                process.env.NATIVE_SHADOW
                    ? []
                    : nativeCustomElementLifecycleEnabled
                    ? [
                          `leaf:${currentLeafName}:connectedCallback`,
                          `leaf:${previousLeafName}:disconnectedCallback`,
                      ]
                    : [`leaf:${currentLeafName}:connectedCallback`],
        },
        {
            fixtureName: 'light DOM',
            tagName: 'x-light-container-multiple-conditionals',
            ctor: LightContainerMultipleConditionals,
            elseBlock: (currentLeafName) => [
                'lightContainer:connectedCallback',
                'lightSlot:connectedCallback',
                `leaf:${currentLeafName}:connectedCallback`,
            ],
            ifBlock: (currentLeafName, previousLeafName) =>
                nativeCustomElementLifecycleEnabled
                    ? [
                          `leaf:${currentLeafName}:connectedCallback`,
                          `leaf:${previousLeafName}:disconnectedCallback`,
                          `leaf:${currentLeafName}:disconnectedCallback`,
                      ]
                    : [
                          `leaf:${currentLeafName}:connectedCallback`,
                          `leaf:${currentLeafName}:disconnectedCallback`,
                      ],
            elseIfBlock: (currentLeafName) => [
                `leaf:${currentLeafName}:connectedCallback`,
                `leaf:${currentLeafName}:disconnectedCallback`,
            ],
        },
    ];

    fixtures.forEach(({ fixtureName, tagName, ctor, ifBlock, elseBlock, elseIfBlock }) => {
        // #TODO[3827]: These regression tests can be removed once the bug is resolved.
        it(`${fixtureName} should maintain callback invocation order for duplicate slots across conditional branches when rerender triggered on conditional slot component`, async () => {
            const container = createElement(tagName, {
                is: ctor,
            });
            document.body.appendChild(container);

            let currentLeafName = container.getLeaf().name;
            expect(window.timingBuffer).toEqual(elseBlock(currentLeafName));

            resetTimingBuffer();

            const slotCmp = container.getSlotCmp();
            // Note in synthetic shadow an error is thrown after rerender occurs,
            // we capture this in the beforeEach and afterEach runs
            slotCmp.showIf = true;
            await Promise.resolve();

            let previousLeafName = currentLeafName;
            currentLeafName = container.getLeaf().name;
            expect(window.timingBuffer).toEqual(ifBlock(currentLeafName, previousLeafName));

            resetTimingBuffer();

            // Note in synthetic shadow an error is thrown after rerender occurs,
            // we capture this in the beforeEach and afterEach runs
            slotCmp.showIf = false;
            slotCmp.showElseIf = true;
            await Promise.resolve();

            previousLeafName = currentLeafName;
            currentLeafName = container.getLeaf().name;
            expect(window.timingBuffer).toEqual(elseIfBlock(currentLeafName, previousLeafName));
        });
    });
});
