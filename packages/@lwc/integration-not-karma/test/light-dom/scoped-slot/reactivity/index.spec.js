import { createElement } from 'lwc';

import ListParentApiData from 'c/listParentApiData';
import WithParentBindings from 'c/withParentBindings';
import ParentBindingsOutsideSlotContent from 'c/parentBindingsOutsideSlotContent';
import ListParentTrackedData from 'c/listParentTrackedData';
import ParentWithConditionalSlotContent from 'c/parentWithConditionalSlotContent';

describe('reactivity in scoped slots', () => {
    beforeEach(() => {
        resetTimingBuffer();
    });

    afterEach(() => {
        delete window.timingBuffer;
    });

    function resetTimingBuffer() {
        window.timingBuffer = [];
    }

    it('rerenders slotted content when mutating value passed from parent to child', async () => {
        const elm = createElement('c-list-parent', { is: ListParentApiData });
        elm.reactivityTestCaseEnabled = true;
        document.body.appendChild(elm);

        resetTimingBuffer();
        elm.changeItemsNestedKey();
        await Promise.resolve();
        const spans = elm.shadowRoot.querySelectorAll('span');
        expect(spans).toHaveSize(2);
        expect(spans[0].innerHTML).toBe('38 - Audio');
        expect(spans[1].innerHTML).toBe('40 - Video');
        expect(window.timingBuffer).toEqual([
            'child:renderedCallback', // value(items) in child's template was changed, so call child's renderedCallback
            'parent:renderedCallback', // item.id is being observed in parent's template, so call its renderedCallback
        ]);
        // reset timing buffer before next rerender
        resetTimingBuffer();
        elm.changeItemsRow();
        await Promise.resolve();
        const spans_1 = elm.shadowRoot.querySelectorAll('span');
        expect(spans_1).toHaveSize(2);
        expect(spans_1[0].innerHTML).toBe('37 - Tape');
        expect(spans_1[1].innerHTML).toBe('40 - Video');
        expect(window.timingBuffer).toEqual(['child:renderedCallback']);
    });

    it("rerenders slotted content when mutating value of child's tracked field", async () => {
        const elm = createElement('c-list-parent', { is: ListParentTrackedData });
        document.body.appendChild(elm);

        resetTimingBuffer();
        const child = elm.shadowRoot.querySelector('c-list-child-tracked-data');
        child.changeItemsNestedKey();
        await Promise.resolve();
        const spans = elm.shadowRoot.querySelectorAll('span');
        expect(spans).toHaveSize(2);
        expect(spans[0].innerHTML).toBe('38 - Audio');
        expect(spans[1].innerHTML).toBe('40 - Video');
        expect(window.timingBuffer).toEqual(['child:renderedCallback', 'parent:renderedCallback']);
        // reset timing buffer before next rerender
        resetTimingBuffer();
        child.changeItemsRow();
        await Promise.resolve();
        const spans_1 = elm.shadowRoot.querySelectorAll('span');
        expect(spans_1).toHaveSize(2);
        expect(spans_1[0].innerHTML).toBe('37 - Tape');
        expect(spans_1[1].innerHTML).toBe('40 - Video');
        expect(window.timingBuffer).toEqual(['child:renderedCallback']);
    });

    it('<slot> tag with key attribute: rerenders slotted content only when iteration key changes', async () => {
        function verifyContentAndCallbacks(expectedContent, expectedCallbacks) {
            expect(
                [...elm.shadowRoot.querySelectorAll('c-slotted-with-callbacks')].map(
                    (_) => _.shadowRoot.innerHTML
                )
            ).toEqual(expectedContent);
            expect(window.timingBuffer).toEqual(expectedCallbacks);
        }
        const elm = createElement('c-list-parent', { is: ListParentApiData });
        elm.callbacksTestCaseEnabled = true;
        resetTimingBuffer();
        document.body.appendChild(elm);

        resetTimingBuffer();
        // Step 1: Change key of iteration entry
        elm.changeItemsNestedKey();
        await Promise.resolve();
        verifyContentAndCallbacks(
            ['38 - Audio', '40 - Video'],
            [
                'child:constructor', // mounts a new child for the new entry
                'child-38:connectedCallback', // Connect and render edited entry
                'child-38:renderedCallback',
                'child-39:disconnectedCallback', // Removed list entry is disconnected
                'childSlotTagWithKey:renderedCallback', // slot receiver has been rendered
                'parent:renderedCallback', // item.id is being observed in parent's template, so call its renderedCallback
            ]
        );
        // reset timing buffer before next rerender
        resetTimingBuffer();
        // Step 2: Change value of iteration entry, should only rehydrate existing element
        elm.changeItemsNestedValue();
        await Promise.resolve();
        verifyContentAndCallbacks(
            ['38 - Light', '40 - Video'],
            [
                'child-38:renderedCallback',
                'childSlotTagWithKey:renderedCallback',
                'parent:renderedCallback',
            ]
        );
        // reset timing buffer before next rerender
        resetTimingBuffer();
        // Step 3: Add new iteration entry
        elm.changeItemsRow();
        await Promise.resolve();
        verifyContentAndCallbacks(
            ['37 - Tape', '40 - Video'],
            [
                'child:constructor',
                'child-37:connectedCallback',
                'child-37:renderedCallback',
                'child-38:disconnectedCallback',
                'childSlotTagWithKey:renderedCallback',
            ]
        );
    });

    describe('slot content containing parent bindings', () => {
        it('is reactive when parent binding value is changed', async () => {
            const elm = createElement('c-parent', { is: WithParentBindings });
            document.body.appendChild(elm);

            const div = elm.shadowRoot.querySelectorAll('div');
            expect(div).toHaveSize(1);
            expect(div[0].innerHTML).toBe("90's hits");

            resetTimingBuffer();
            elm.changeLabel();
            await Promise.resolve();
            const div_1 = elm.shadowRoot.querySelectorAll('div');
            expect(div_1).toHaveSize(1);
            expect(div_1[0].innerHTML).toBe('2000 hits');
            expect(window.timingBuffer).toEqual([
                'child:renderedCallback',
                'parent:renderedCallback', // label is part of parent's template, call its renderedCallback
            ]);
        });

        it("rerenders parent and child when bindings are used in parent's non slot content", async () => {
            const elm = createElement('c-parent', { is: ParentBindingsOutsideSlotContent });
            document.body.appendChild(elm);

            const div = elm.shadowRoot.querySelectorAll('div');
            expect(div).toHaveSize(1);
            expect(div[0].innerHTML).toBe("90's hits");

            resetTimingBuffer();
            elm.changeLabel();
            await Promise.resolve();
            const div_1 = elm.shadowRoot.querySelectorAll('div');
            // verify child is rerendered
            expect(div_1).toHaveSize(1);
            expect(div_1[0].innerHTML).toBe('2000 hits');
            // verify  parent is rerendered
            expect(elm.shadowRoot.querySelector('p').innerHTML).toBe('2000 hits');
            expect(window.timingBuffer).toEqual([
                'child:renderedCallback',
                'parent:renderedCallback',
            ]);
        });
    });

    describe('nested directives', () => {
        it('slot content can contain if:true directive and is reactive', async () => {
            function verifySlotContent(expectedContent) {
                expect([...elm.shadowRoot.querySelectorAll('div')].map((_) => _.innerHTML)).toEqual(
                    expectedContent
                );
            }
            const elm = createElement('c-parent', { is: ParentWithConditionalSlotContent });
            document.body.appendChild(elm);
            const child = elm.shadowRoot.querySelector('c-child-for-conditional-slot-content');

            verifySlotContent([]);
            await Promise.resolve();
            verifySlotContent([]);
            // toggle visibility flag in child
            child.visible = true;
            await Promise.resolve();
            // Verify that parent's scoped slot content is rendered
            verifySlotContent(['Variation 1']);
            // Verify that slot content is reactive to changes in parent's tracked data
            elm.enableVariation2();
            await Promise.resolve();
            verifySlotContent(['Variation 1', 'Variation 2']);
            // Switch of all slot content. Should still work because the vfragement still has empty text nodes that will be allocated
            elm.disableAllVariations();
            await Promise.resolve();
            verifySlotContent([]);
            // toggle off visibility flag in child and verify that content is reset
            elm.enableVariation2();
            child.visible = false;
            await Promise.resolve();
            verifySlotContent([]);
        });
    });
});
