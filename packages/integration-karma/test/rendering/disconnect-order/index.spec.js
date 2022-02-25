import { createElement } from 'lwc';

import ShadowParent from 'x/shadowParent';
import LightParent from 'x/lightParent';
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
            'shadowParent:disconnectedCallback',
            'leaf:after-container:disconnectedCallback',
            'shadowContainer:disconnectedCallback',
            'leaf:after-slot:disconnectedCallback',
            'leaf:before-slot:disconnectedCallback',
            'leaf:slotted-a:disconnectedCallback',
            'leaf:slotted-b:disconnectedCallback',
            'leaf:before-container:disconnectedCallback',
        ]);
    });
});
