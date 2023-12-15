import { createElement } from 'lwc';
import { nativeCustomElementLifecycleEnabled } from 'test-utils';

import Single from 'x/single';
import Parent from 'x/parent';
import ParentIf from 'x/parentIf';
import ParentProp from 'x/parentProp';
import Container from 'invocationorder/container';
import DispatchEvents from 'x/dispatchEvents';

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

/*
The exact invocation order is not important so it's ok that native and synthetic have different
orderings. For any given component, the invariants are:

1) connectedCallback is invoked after the parent connectedCallback (top-down)
2) renderedCallback is invoked before the parent renderedCallback (bottom-up)
3) renderedCallback is invoked after connectedCallback

It's ok to update the orderings below after a refactor, as long as these invariants hold!
*/
if (process.env.NATIVE_SHADOW) {
    it(`should invoke connectedCallback and renderedCallback in the expected order (native shadow)`, () => {
        const elm = createElement('order-container', { is: Container });
        document.body.appendChild(elm);
        expect(window.timingBuffer).toEqual(
            nativeCustomElementLifecycleEnabled
                ? [
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
                  ]
                : [
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
                  ]
        );
    });
} else {
    it(`should invoke connectedCallback and renderedCallback in the expected order (synthetic shadow)`, () => {
        const elm = createElement('order-container', { is: Container });
        document.body.appendChild(elm);
        expect(window.timingBuffer).toEqual([
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
        ]);
    });
}

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
