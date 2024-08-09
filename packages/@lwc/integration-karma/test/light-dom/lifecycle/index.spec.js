import { createElement } from 'lwc';
import { extractDataIds, USE_LIGHT_DOM_SLOT_FORWARDING } from 'test-utils';

import SlotForwarding from 'x/slotForwarding';
import DynamicSlotForwarding from 'x/dynamicSlotForwarding';
import StandardSlotting from 'x/standardSlotting';
import BasicContainer from 'x/basicContainer';

import { resetId } from './util.js';

const resetTimingBuffer = () => {
    window.timingBuffer = [];
};

beforeEach(() => {
    window.timingBuffer = [];
    resetId();
});

afterEach(() => {
    delete window.timingBuffer;
});

describe('standard slotting', () => {
    it('invokes expected lifecycle methods', async () => {
        const elm = createElement('x-standard-slotting', { is: StandardSlotting });
        elm.show = true;
        document.body.appendChild(elm);
        await Promise.resolve();

        expect(window.timingBuffer).toEqual([
            '0:connectedCallback',
            '1:connectedCallback',
            '2:connectedCallback',
        ]);

        resetTimingBuffer();

        elm.show = false;
        await Promise.resolve();

        // Timing of disconnectedCallback differs between native/synthetic lifecycle
        expect(window.timingBuffer).toEqual(
            lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
                ? ['2:disconnectedCallback', '0:disconnectedCallback', '1:disconnectedCallback']
                : ['2:disconnectedCallback', '0:disconnectedCallback', '1:disconnectedCallback']
        );
    });

    it('should invoke lifecycle methods at all', async () => {
        const elm = createElement('x-basic-container', { is: BasicContainer });
        document.body.appendChild(elm);
        await Promise.resolve();

        expect(window.timingBuffer).toEqual([]);

        const setShow = async (show) => {
            resetTimingBuffer();
            elm.show = show;
            await Promise.resolve();
        };

        await setShow(true);
        expect(window.timingBuffer).toEqual(['0:connectedCallback']);

        await setShow(false);
        expect(window.timingBuffer).toEqual(['0:disconnectedCallback']);

        await setShow(true);
        expect(window.timingBuffer).toEqual(['1:connectedCallback']);

        await setShow(false);
        expect(window.timingBuffer).toEqual(['1:disconnectedCallback']);
    });
});

if (USE_LIGHT_DOM_SLOT_FORWARDING) {
    describe('slot forwarding', () => {
        it('invokes lifecycle methods in correct order - static', async () => {
            const elm = createElement('x-slot-forwarding', { is: SlotForwarding });
            document.body.appendChild(elm);
            await Promise.resolve();

            expect(window.timingBuffer).toEqual([
                '0:connectedCallback',
                '1:connectedCallback',
                '2:connectedCallback',
            ]);

            resetTimingBuffer();

            elm.showTop = true;
            await Promise.resolve();

            // Timing of disconnectedCallback differs between native/synthetic lifecycle
            expect(window.timingBuffer).toEqual(
                lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
                    ? [
                          '3:connectedCallback',
                          '4:connectedCallback',
                          '5:connectedCallback',
                          '2:disconnectedCallback',
                          '0:disconnectedCallback',
                          '1:disconnectedCallback',
                      ]
                    : [
                          '3:connectedCallback',
                          '4:connectedCallback',
                          '5:connectedCallback',
                          '2:disconnectedCallback',
                          '0:disconnectedCallback',
                          '1:disconnectedCallback',
                      ]
            );

            resetTimingBuffer();

            elm.showTop = false;
            await Promise.resolve();

            // Timing of disconnectedCallback differs between native/synthetic lifecycle
            expect(window.timingBuffer).toEqual(
                lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
                    ? [
                          '6:connectedCallback',
                          '7:connectedCallback',
                          '8:connectedCallback',
                          '5:disconnectedCallback',
                          '3:disconnectedCallback',
                          '4:disconnectedCallback',
                      ]
                    : [
                          '6:connectedCallback',
                          '7:connectedCallback',
                          '8:connectedCallback',
                          '5:disconnectedCallback',
                          '3:disconnectedCallback',
                          '4:disconnectedCallback',
                      ]
            );
        });

        it('invokes lifecycle methods in correct order - dynamic', async () => {
            const elm = createElement('x-dynamic-slot-forwarding', { is: DynamicSlotForwarding });
            document.body.appendChild(elm);
            await Promise.resolve();

            // Initial connection
            expect(window.timingBuffer).toEqual([
                '0:connectedCallback',
                '1:connectedCallback',
                '2:connectedCallback',
            ]);

            resetTimingBuffer();

            // Trigger vdom diffing
            elm.showTop = true;
            await Promise.resolve();

            // Timing of disconnectedCallback differs between native/synthetic lifecycle
            expect(window.timingBuffer).toEqual(
                lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
                    ? [
                          '3:connectedCallback',
                          '4:connectedCallback',
                          '5:connectedCallback',
                          '2:disconnectedCallback',
                          '0:disconnectedCallback',
                          '1:disconnectedCallback',
                      ]
                    : [
                          '3:connectedCallback',
                          '4:connectedCallback',
                          '5:connectedCallback',
                          '2:disconnectedCallback',
                          '0:disconnectedCallback',
                          '1:disconnectedCallback',
                      ]
            );

            resetTimingBuffer();

            // Trigger vdom diffing from top level
            elm.topTop = 'bottom';
            elm.topBottom = 'top';
            await Promise.resolve();

            expect(window.timingBuffer).toEqual([
                '6:connectedCallback',
                '5:disconnectedCallback',
                '7:connectedCallback',
                '3:disconnectedCallback',
            ]);

            resetTimingBuffer();

            const { topSlot } = extractDataIds(elm);
            // Trigger vdom diffing from forwarded slot level
            topSlot.top = 'top';
            topSlot.bottom = 'bottom';
            await Promise.resolve();

            expect(window.timingBuffer).toEqual([
                '8:connectedCallback',
                '6:disconnectedCallback',
                '9:connectedCallback',
                '7:disconnectedCallback',
            ]);

            resetTimingBuffer();

            // vdom diffing after changing vnodes
            elm.showTop = false;
            await Promise.resolve();

            // Timing of disconnectedCallback differs between native/synthetic lifecycle
            expect(window.timingBuffer).toEqual(
                lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
                    ? [
                          '10:connectedCallback',
                          '11:connectedCallback',
                          '12:connectedCallback',
                          '8:disconnectedCallback',
                          '9:disconnectedCallback',
                          '4:disconnectedCallback',
                      ]
                    : [
                          '10:connectedCallback',
                          '11:connectedCallback',
                          '12:connectedCallback',
                          '8:disconnectedCallback',
                          '9:disconnectedCallback',
                          '4:disconnectedCallback',
                      ]
            );
        });
    });
}
