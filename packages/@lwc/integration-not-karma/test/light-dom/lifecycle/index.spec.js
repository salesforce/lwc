import { createElement } from 'lwc';

import SlotForwarding from 'c/slotForwarding';
import DynamicSlotForwarding from 'c/dynamicSlotForwarding';
import StandardSlotting from 'c/standardSlotting';
import BasicContainer from 'c/basicContainer';
import { USE_LIGHT_DOM_SLOT_FORWARDING } from '../../../helpers/constants.js';
import { extractDataIds } from '../../../helpers/utils.js';

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

describe('basic lifecycle hooks', () => {
    it('should invoke connectedCallback/disconnectedCallback at all', async () => {
        const elm = createElement('c-basic-container', { is: BasicContainer });
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

describe('standard slotting', () => {
    let elm;

    const setup = async () => {
        elm = createElement('c-standard-slotting', { is: StandardSlotting });
        elm.show = true;
        document.body.appendChild(elm);
        await Promise.resolve();

        expect(window.timingBuffer).toEqual([
            '0:connectedCallback',
            '1:connectedCallback',
            '2:connectedCallback',
        ]);

        resetTimingBuffer();
    };

    it('invokes expected lifecycle methods', async () => {
        await setup();

        elm.show = false;
        await Promise.resolve();

        // Timing of disconnectedCallback differs if light DOM slot forwarding is enabled
        expect(window.timingBuffer).toEqual(
            USE_LIGHT_DOM_SLOT_FORWARDING
                ? ['2:disconnectedCallback', '0:disconnectedCallback', '1:disconnectedCallback']
                : ['0:disconnectedCallback', '1:disconnectedCallback', '2:disconnectedCallback']
        );
    });

    it('invokes disconnectedCallback after removing entire element', async () => {
        await setup();

        // remove entire element
        document.body.removeChild(elm);
        await Promise.resolve();

        // Timing of disconnectedCallback differs if light DOM slot forwarding is enabled
        expect(window.timingBuffer).toEqual(
            USE_LIGHT_DOM_SLOT_FORWARDING
                ? ['2:disconnectedCallback', '0:disconnectedCallback', '1:disconnectedCallback']
                : ['0:disconnectedCallback', '1:disconnectedCallback', '2:disconnectedCallback']
        );
    });
});

describe.runIf(USE_LIGHT_DOM_SLOT_FORWARDING)('slot forwarding', () => {
    describe('static', () => {
        let elm;
        const setup = async () => {
            elm = createElement('c-slot-forwarding', { is: SlotForwarding });
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

            expect(window.timingBuffer).toEqual([
                '3:connectedCallback',
                '4:connectedCallback',
                '5:connectedCallback',
                '2:disconnectedCallback',
                '0:disconnectedCallback',
                '1:disconnectedCallback',
            ]);

            resetTimingBuffer();
        };

        it('invokes lifecycle methods in correct order', async () => {
            await setup();

            elm.showTop = false;
            await Promise.resolve();

            expect(window.timingBuffer).toEqual([
                '6:connectedCallback',
                '7:connectedCallback',
                '8:connectedCallback',
                '5:disconnectedCallback',
                '3:disconnectedCallback',
                '4:disconnectedCallback',
            ]);
        });

        it('invokes disconnectedCallback after removing entire element', async () => {
            await setup();

            // remove entire element
            document.body.removeChild(elm);
            await Promise.resolve();

            expect(window.timingBuffer).toEqual([
                '5:disconnectedCallback',
                '3:disconnectedCallback',
                '4:disconnectedCallback',
            ]);
        });
    });

    describe('dynamic', () => {
        let elm;
        const setup = async () => {
            elm = createElement('c-dynamic-slot-forwarding', { is: DynamicSlotForwarding });
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

            expect(window.timingBuffer).toEqual([
                '3:connectedCallback',
                '4:connectedCallback',
                '5:connectedCallback',
                '2:disconnectedCallback',
                '0:disconnectedCallback',
                '1:disconnectedCallback',
            ]);

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
        };

        it('invokes lifecycle methods in correct order', async () => {
            await setup();

            // vdom diffing after changing vnodes
            elm.showTop = false;
            await Promise.resolve();

            expect(window.timingBuffer).toEqual([
                '10:connectedCallback',
                '11:connectedCallback',
                '12:connectedCallback',
                '8:disconnectedCallback',
                '9:disconnectedCallback',
                '4:disconnectedCallback',
            ]);
        });

        it('invokes disconnectedCallback after removing entire element', async () => {
            await setup();

            // remove entire element
            document.body.removeChild(elm);
            await Promise.resolve();

            expect(window.timingBuffer).toEqual([
                '8:disconnectedCallback',
                '9:disconnectedCallback',
                '4:disconnectedCallback',
            ]);
        });
    });
});
