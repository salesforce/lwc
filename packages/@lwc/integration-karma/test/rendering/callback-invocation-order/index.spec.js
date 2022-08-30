import { createElement } from 'lwc';

import ShadowParent from 'x/shadowParent';
import ShadowLightParent from 'x/shadowLightParent';
import LightParent from 'x/lightParent';
import LightShadowParent from 'x/lightShadowParent';
import ToggleContainer from 'x/toggleContainer';

function resetTimingBuffer() {
    window.timingBuffer = [];
}

beforeEach(() => {
    resetTimingBuffer();
});

afterEach(() => {
    delete window.timingBuffer;
});

const fixtures = [
    {
        tagName: 'x-shadow-parent',
        ctor: ShadowParent,
        connect: process.env.NATIVE_SHADOW
            ? window.lwcRuntimeFlags.ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
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
            ? window.lwcRuntimeFlags.ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
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
            ? window.lwcRuntimeFlags.ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
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
            window.lwcRuntimeFlags.ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
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
