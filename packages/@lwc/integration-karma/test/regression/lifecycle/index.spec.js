import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';

import NativeSloterSyntheticSlotee from 'x/nativeSloterSyntheticSlotee';
import SyntheticSloterSyntheticSlotee from 'x/syntheticSloterSyntheticSlotee';
import NativeSloterNativeSlotee from 'x/nativeSloterNativeSlotee';

describe('W-15904769', () => {
    beforeEach(() => {
        window.timingBuffer = [];
    });

    afterEach(() => delete window.timingBuffer);

    const assertSlottedChildrenLength = (elm, expected) => {
        const actual = extractDataIds(elm);
        expect(Object.keys(actual).filter((node) => !node.includes('.shadowRoot')).length).toBe(
            expected
        );
    };

    // If `lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE` is true, then components no longer run in a
    // "mixed" lifecycle mode, so this bug cannot repro.
    if (!process.env.NATIVE_SHADOW && !lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE) {
        it('native sloter + synthetic slotee disconnects root and subtree components but does not reconnect synthetic subtree', async () => {
            const elm = createElement('x-native-sloter-synthetic-slotee', {
                is: NativeSloterSyntheticSlotee,
            });
            document.body.appendChild(elm);
            await Promise.resolve();

            assertSlottedChildrenLength(elm, 3);
            expect(window.timingBuffer.length).toBe(3);
            expect(window.timingBuffer[0]).toBe('x-use-api-version-61-sloter: connectedCallback');
            expect(window.timingBuffer[1]).toBe('x-use-api-version-61-sloter: connectedCallback');
            expect(window.timingBuffer[2]).toBe('x-use-api-version-60-slotee: connectedCallback');

            // Hide spans which reorders the children and causes x-use-api-version-61-sloter to be re-inserted in the DOM
            elm.toggleSpans();
            await Promise.resolve();
            assertSlottedChildrenLength(elm, 1);
            expect(window.timingBuffer.length).toBe(6);
            expect(window.timingBuffer[3]).toBe(
                'x-use-api-version-61-sloter: disconnectedCallback'
            );
            // Notice x-use-api-version-60-slotee disconnectedCallback is fired but not its connectedCallback
            expect(window.timingBuffer[4]).toBe(
                'x-use-api-version-60-slotee: disconnectedCallback'
            );
            expect(window.timingBuffer[5]).toBe('x-use-api-version-61-sloter: connectedCallback');

            // Re-insert the spans but does not cause x-use-api-version-61-sloter to be re-inserted because it's in the same position
            elm.toggleSpans();
            await Promise.resolve();
            assertSlottedChildrenLength(elm, 3);
            // Note no new lifecycle invocations have occurred
            expect(window.timingBuffer.length).toBe(6);

            // Hide spans again, causes x-use-api-version-61-sloter to be re-inserted, notice only connectedCallback is called on x-use-api-version-61-sloter
            elm.toggleSpans();
            await Promise.resolve();
            assertSlottedChildrenLength(elm, 1);
            expect(window.timingBuffer.length).toBe(8);
            // Note going forward only x-use-api-version-61-sloter has disconnected/connected callbacks invoked
            expect(window.timingBuffer[6]).toBe(
                'x-use-api-version-61-sloter: disconnectedCallback'
            );
            expect(window.timingBuffer[7]).toBe('x-use-api-version-61-sloter: connectedCallback');
        });

        it('synthetic sloter + slotee does not disconnect or reconnect when sloter is moved', async () => {
            const elm = createElement('x-synthetic-sloter-synthetic-slotee', {
                is: SyntheticSloterSyntheticSlotee,
            });
            document.body.appendChild(elm);
            await Promise.resolve();

            assertSlottedChildrenLength(elm, 3);
            expect(window.timingBuffer.length).toBe(3);
            expect(window.timingBuffer[0]).toBe('x-use-api-version-60-sloter: connectedCallback');
            expect(window.timingBuffer[1]).toBe('x-use-api-version-60-sloter: connectedCallback');
            expect(window.timingBuffer[2]).toBe('x-use-api-version-60-slotee: connectedCallback');

            // Note synthetic lifecycle does not invoke lifecycle methods when moving elements in the DOM
            elm.toggleSpans();
            await Promise.resolve();
            assertSlottedChildrenLength(elm, 1);
            expect(window.timingBuffer.length).toBe(3);

            elm.toggleSpans();
            await Promise.resolve();
            assertSlottedChildrenLength(elm, 3);
            expect(window.timingBuffer.length).toBe(3);
        });

        it('native sloter + slotee disconnects and reconnects both when sloter is moved', async () => {
            const elm = createElement('x-native-sloter-native-slotee', {
                is: NativeSloterNativeSlotee,
            });
            document.body.appendChild(elm);
            await Promise.resolve();

            assertSlottedChildrenLength(elm, 3);
            expect(window.timingBuffer.length).toBe(3);
            expect(window.timingBuffer[0]).toBe('x-use-api-version-61-sloter: connectedCallback');
            expect(window.timingBuffer[1]).toBe('x-use-api-version-61-sloter: connectedCallback');
            expect(window.timingBuffer[2]).toBe('x-use-api-version-61-slotee: connectedCallback');

            elm.toggleSpans();
            await Promise.resolve();
            assertSlottedChildrenLength(elm, 1);
            expect(window.timingBuffer.length).toBe(7);
            expect(window.timingBuffer[3]).toBe(
                'x-use-api-version-61-sloter: disconnectedCallback'
            );
            expect(window.timingBuffer[4]).toBe(
                'x-use-api-version-61-slotee: disconnectedCallback'
            );
            expect(window.timingBuffer[5]).toBe('x-use-api-version-61-sloter: connectedCallback');
            expect(window.timingBuffer[6]).toBe('x-use-api-version-61-slotee: connectedCallback');

            elm.toggleSpans();
            await Promise.resolve();
            assertSlottedChildrenLength(elm, 3);
            expect(window.timingBuffer.length).toBe(7);

            elm.toggleSpans();
            await Promise.resolve();
            assertSlottedChildrenLength(elm, 1);
            expect(window.timingBuffer.length).toBe(11);
            expect(window.timingBuffer[7]).toBe(
                'x-use-api-version-61-sloter: disconnectedCallback'
            );
            expect(window.timingBuffer[8]).toBe(
                'x-use-api-version-61-slotee: disconnectedCallback'
            );
            expect(window.timingBuffer[9]).toBe('x-use-api-version-61-sloter: connectedCallback');
            expect(window.timingBuffer[10]).toBe('x-use-api-version-61-slotee: connectedCallback');
        });
    } else {
        [
            { name: 'x-native-sloter-synthetic-slotee', ctor: NativeSloterSyntheticSlotee },
            { name: 'x-synthetic-sloter-synthetic-slotee', ctor: SyntheticSloterSyntheticSlotee },
            { name: 'x-native-sloter-native-slotee', ctor: NativeSloterNativeSlotee },
        ].forEach(({ name, ctor }) => {
            it(`${name} - sloter + slotee connected and never disconnected when sloter is moved`, async () => {
                const elm = createElement(name, { is: ctor });
                document.body.appendChild(elm);
                await Promise.resolve();

                expect(window.timingBuffer.length).toBe(3);
                window.timingBuffer.forEach((lifecycle) => {
                    expect(lifecycle).toContain('connectedCallback');
                });

                // Note native shadow does not invoke lifecycle methods when moving elements in the DOM
                elm.toggleSpans();
                await Promise.resolve();
                expect(window.timingBuffer.length).toBe(3);

                elm.toggleSpans();
                await Promise.resolve();
                expect(window.timingBuffer.length).toBe(3);
            });
        });
    }
});
