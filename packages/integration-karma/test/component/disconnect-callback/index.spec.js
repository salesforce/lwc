import { createElement } from 'lwc';

import Container from 'x/container';

function resetTimingBuffer() {
    window.timingBuffer = [];
}

beforeEach(() => {
    resetTimingBuffer();
});

afterEach(() => {
    delete window.timingBuffer;
});

// TODO [#1798]: Some incosistency between chrome v/s firefox & Safari
// In firefox, the host element is disconnected followed by its light dom and then its shadow dom
xit('should disconnect on the right order (issue #1199 and #1198)', () => {
    const elm = createElement('x-container', { is: Container });
    document.body.appendChild(elm);
    expect(window.timingBuffer.length).toEqual(15);

    resetTimingBuffer();
    elm.hide = true;

    return Promise.resolve().then(() => {
        expect(window.timingBuffer).toEqual([
            'parent:disconnectedCallback',
            'ownChild:disconnectedCallback',
            'grandChild:disconnectedCallback',
            'adoptedChild:disconnectedCallback',
            'grandChild:disconnectedCallback',
        ]);

        resetTimingBuffer();
    });
});
