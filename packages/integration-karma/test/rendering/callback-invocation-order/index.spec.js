import { createElement } from 'lwc';

import ShadowParent from 'x/shadowParent';
import ShadowLightParent from 'x/shadowLightParent';
import LightParent from 'x/lightParent';
import LightShadowParent from 'x/lightShadowParent';
import ToggleContainer from 'x/toggleContainer';

function resetTimingBuffer() {
    window.timingBuffer = [];
}

function connectedTimings(evts) {
    return evts.map((evt) => `${evt}:connectedCallback`);
}

function disconnectedTimings(evts) {
    return evts.map((evt) => `${evt}:disconnectedCallback`);
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
            ? [
                  'shadowParent',
                  'leaf:before-container',
                  'shadowContainer',
                  'leaf:slotted-a',
                  'leaf:slotted-b',
                  'leaf:before-slot',
                  'leaf:after-slot',
                  'leaf:after-container',
              ]
            : [
                  'shadowParent',
                  'leaf:before-container',
                  'shadowContainer',
                  'leaf:before-slot',
                  'leaf:slotted-a',
                  'leaf:slotted-b',
                  'leaf:after-slot',
                  'leaf:after-container',
              ],
        disconnect: process.env.NATIVE_SHADOW
            ? [
                  'shadowParent',
                  'leaf:before-container',
                  'shadowContainer',
                  'leaf:before-slot',
                  'leaf:after-slot',
                  'leaf:slotted-a',
                  'leaf:slotted-b',
                  'leaf:after-container',
              ]
            : [
                  'shadowParent',
                  'leaf:before-container',
                  'shadowContainer',
                  'leaf:before-slot',
                  'leaf:slotted-a',
                  'leaf:slotted-b',
                  'leaf:after-slot',
                  'leaf:after-container',
              ],
    },
    {
        tagName: 'x-shadow-light-parent',
        ctor: ShadowLightParent,
        connect: process.env.NATIVE_SHADOW
            ? [
                  'shadowLightParent',
                  'lightContainer',
                  'leaf:before-slot',
                  'leaf:slotted-shadow',
                  'leaf:after-slot',
              ]
            : [
                  'shadowLightParent',
                  'lightContainer',
                  'leaf:before-slot',
                  'leaf:slotted-shadow',
                  'leaf:after-slot',
              ],
        disconnect: [
            'shadowLightParent',
            'lightContainer',
            'leaf:before-slot',
            'leaf:slotted-shadow',
            'leaf:after-slot',
        ],
    },
    {
        tagName: 'x-light-parent',
        ctor: LightParent,
        connect: [
            'lightParent',
            'leaf:before-container',
            'lightContainer',
            'leaf:before-slot',
            'leaf:slotted-a',
            'leaf:slotted-b',
            'leaf:after-slot',
            'leaf:after-container',
        ],
        disconnect: [
            'lightParent',
            'leaf:before-container',
            'lightContainer',
            'leaf:before-slot',
            'leaf:slotted-a',
            'leaf:slotted-b',
            'leaf:after-slot',
            'leaf:after-container',
        ],
    },
    {
        tagName: 'x-light-shadow-parent',
        ctor: LightShadowParent,
        connect: process.env.NATIVE_SHADOW
            ? [
                  'lightShadowContainer',
                  'shadowContainer',
                  'leaf:slotted-light',
                  'leaf:before-slot',
                  'leaf:after-slot',
              ]
            : [
                  'lightShadowContainer',
                  'shadowContainer',
                  'leaf:before-slot',
                  'leaf:slotted-light',
                  'leaf:after-slot',
              ],
        disconnect: process.env.NATIVE_SHADOW
            ? [
                  'lightShadowContainer',
                  'shadowContainer',
                  'leaf:before-slot',
                  'leaf:after-slot',
                  'leaf:slotted-light',
              ]
            : [
                  'lightShadowContainer',
                  'shadowContainer',
                  'leaf:before-slot',
                  'leaf:slotted-light',
                  'leaf:after-slot',
              ],
    },
];

for (const { tagName, ctor, connect, disconnect } of fixtures) {
    it(`${tagName} - should invoke callbacks in the right order`, () => {
        const elm = createElement(tagName, { is: ctor });

        document.body.appendChild(elm);
        expect(window.timingBuffer).toEqual(connectedTimings(connect));

        resetTimingBuffer();

        document.body.removeChild(elm);
        expect(window.timingBuffer).toEqual(disconnectedTimings(disconnect));
    });
}

it('should invoke callbacks on the right order (issue #1199 and #1198)', () => {
    const expectedConnected = connectedTimings(
        process.env.NATIVE_SHADOW
            ? [
                  'shadowContainer',
                  'parent:a',
                  'leaf:a',
                  'parent:b',
                  'leaf:b',
                  'leaf:before-slot',
                  'leaf:after-slot',
              ]
            : [
                  'shadowContainer',
                  'leaf:before-slot',
                  'parent:a',
                  'leaf:a',
                  'parent:b',
                  'leaf:b',
                  'leaf:after-slot',
              ]
    );
    const expectedDisconnected = disconnectedTimings(
        process.env.NATIVE_SHADOW
            ? [
                  'shadowContainer',
                  'leaf:before-slot',
                  'leaf:after-slot',
                  'parent:a',
                  'leaf:a',
                  'parent:b',
                  'leaf:b',
              ]
            : [
                  'shadowContainer',
                  'leaf:before-slot',
                  'parent:a',
                  'leaf:a',
                  'parent:b',
                  'leaf:b',
                  'leaf:after-slot',
              ]
    );

    const elm = createElement('x-toggle-container', { is: ToggleContainer });

    document.body.appendChild(elm);
    expect(window.timingBuffer).toEqual(expectedConnected);

    resetTimingBuffer();

    elm.hide = true;
    return Promise.resolve().then(() => {
        expect(window.timingBuffer).toEqual(expectedDisconnected);
    });
});
