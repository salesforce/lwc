import { createElement } from 'lwc';

import ShadowParent from 'x/shadowParent';
import ShadowLightParent from 'x/shadowLightParent';
import LightParent from 'x/lightParent';
import LightShadowParent from 'x/lightShadowParent';
import ToggleContainer from 'x/toggleContainer';

beforeEach(() => {
    window.timingBuffer = [];
});

afterEach(() => {
    delete window.timingBuffer;
});

const fixtures = [
    {
        tagName: 'x-shadow-parent',
        ctor: ShadowParent,
        values: [
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
        values: [
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
        values: [
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
        values: [
            'lightShadowContainer:disconnectedCallback',
            'shadowContainer:disconnectedCallback',
            'leaf:after-slot:disconnectedCallback',
            'leaf:before-slot:disconnectedCallback',
            'leaf:slotted-light:disconnectedCallback',
        ],
    },
];

for (const { tagName, ctor, values: expectedValues } of fixtures) {
    it(`${tagName} - should invoke disconnectedCallback in the right order`, () => {
        const elm = createElement(tagName, { is: ctor });
        document.body.appendChild(elm);

        document.body.removeChild(elm);
        expect(window.timingBuffer).toEqual(expectedValues);
    });
}

it('should disconnect on the right order (issue #1199 and #1198)', () => {
    const elm = createElement('x-toggle-container', { is: ToggleContainer });
    document.body.appendChild(elm);

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
