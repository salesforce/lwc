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
        disconnect: [
            'lightShadowContainer:disconnectedCallback',
            'shadowContainer:disconnectedCallback',
            'leaf:after-slot:disconnectedCallback',
            'leaf:before-slot:disconnectedCallback',
            'leaf:slotted-light:disconnectedCallback',
        ],
    },
];

for (const { tagName, ctor, disconnect: expectedDisconnect } of fixtures) {
    it(`${tagName} - should invoke disconnectedCallback in the right order`, () => {
        const elm = createElement(tagName, { is: ctor });
        document.body.appendChild(elm);

        resetTimingBuffer();

        document.body.removeChild(elm);
        expect(window.timingBuffer).toEqual(expectedDisconnect);
    });
}

it('should disconnect on the right order (issue #1199 and #1198)', () => {
    const elm = createElement('x-toggle-container', { is: ToggleContainer });
    document.body.appendChild(elm);

    resetTimingBuffer();
    elm.hide = true;
    return Promise.resolve().then(() => {
        expect(window.timingBuffer).toEqual([
            'shadowContainer:disconnectedCallback',
            'leaf:after-slot:disconnectedCallback',
            'leaf:before-slot:disconnectedCallback',
            'parent:a:disconnectedCallback',
            'leaf:a:disconnectedCallback',
            'parent:b:disconnectedCallback',
            'leaf:b:disconnectedCallback',
        ]);
    });
});
