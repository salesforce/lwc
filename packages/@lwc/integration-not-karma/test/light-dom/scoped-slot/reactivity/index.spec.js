import { createElement } from 'lwc';

import ListParentApiData from 'x/listParentApiData';
import WithParentBindings from 'x/withParentBindings';
import ParentBindingsOutsideSlotContent from 'x/parentBindingsOutsideSlotContent';
import ListParentTrackedData from 'x/listParentTrackedData';
import ParentWithConditionalSlotContent from 'x/parentWithConditionalSlotContent';

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

    it('rerenders slotted content when mutating value passed from parent to child', () => {
        const elm = createElement('x-list-parent', { is: ListParentApiData });
        elm.reactivityTestCaseEnabled = true;
        document.body.appendChild(elm);

        resetTimingBuffer();
        elm.changeItemsNestedKey();
        return Promise.resolve()
            .then(() => {
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
                // contents of items is being observed by x-child and not by x-parent.
                // Adding a new row or changing an entire row will only trigger renderedCallback of x-child and not of the parent
            })
            .then(() => {
                const spans = elm.shadowRoot.querySelectorAll('span');
                expect(spans).toHaveSize(2);
                expect(spans[0].innerHTML).toBe('37 - Tape');
                expect(spans[1].innerHTML).toBe('40 - Video');
                expect(window.timingBuffer).toEqual(['child:renderedCallback']);
            });
    });

    it("rerenders slotted content when mutating value of child's tracked field", () => {
        const elm = createElement('x-list-parent', { is: ListParentTrackedData });
        document.body.appendChild(elm);

        resetTimingBuffer();
        const child = elm.shadowRoot.querySelector('x-list-child-tracked-data');
        child.changeItemsNestedKey();
        return Promise.resolve()
            .then(() => {
                const spans = elm.shadowRoot.querySelectorAll('span');
                expect(spans).toHaveSize(2);
                expect(spans[0].innerHTML).toBe('38 - Audio');
                expect(spans[1].innerHTML).toBe('40 - Video');
                expect(window.timingBuffer).toEqual([
                    'child:renderedCallback',
                    'parent:renderedCallback',
                ]);

                // reset timing buffer before next rerender
                resetTimingBuffer();
                child.changeItemsRow();
            })
            .then(() => {
                const spans = elm.shadowRoot.querySelectorAll('span');
                expect(spans).toHaveSize(2);
                expect(spans[0].innerHTML).toBe('37 - Tape');
                expect(spans[1].innerHTML).toBe('40 - Video');
                expect(window.timingBuffer).toEqual([
                    'child:renderedCallback',
                    // Since the parent observes changes to the contents of the individual rows and not the items itself the parent's renderedCallback isn't invoked
                ]);
            });
    });

    it('<slot> tag with key attribute: rerenders slotted content only when iteration key changes', () => {
        function verifyContentAndCallbacks(expectedContent, expectedCallbacks) {
            expect(
                [...elm.shadowRoot.querySelectorAll('x-slotted-with-callbacks')].map(
                    (_) => _.shadowRoot.innerHTML
                )
            ).toEqual(expectedContent);
            expect(window.timingBuffer).toEqual(expectedCallbacks);
        }
        const elm = createElement('x-list-parent', { is: ListParentApiData });
        elm.callbacksTestCaseEnabled = true;
        resetTimingBuffer();
        document.body.appendChild(elm);

        resetTimingBuffer();
        // Step 1: Change key of iteration entry
        elm.changeItemsNestedKey();
        return Promise.resolve()
            .then(() => {
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
            })
            .then(() => {
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
            })
            .then(() => {
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
    });

    describe('slot content containing parent bindings', () => {
        it('is reactive when parent binding value is changed', () => {
            const elm = createElement('x-parent', { is: WithParentBindings });
            document.body.appendChild(elm);

            const div = elm.shadowRoot.querySelectorAll('div');
            expect(div).toHaveSize(1);
            expect(div[0].innerHTML).toBe("90's hits");

            resetTimingBuffer();
            elm.changeLabel();
            return Promise.resolve().then(() => {
                const div = elm.shadowRoot.querySelectorAll('div');
                expect(div).toHaveSize(1);
                expect(div[0].innerHTML).toBe('2000 hits');
                expect(window.timingBuffer).toEqual([
                    'child:renderedCallback',
                    'parent:renderedCallback', // label is part of parent's template, call its renderedCallback
                ]);
            });
        });

        it("rerenders parent and child when bindings are used in parent's non slot content", () => {
            const elm = createElement('x-parent', { is: ParentBindingsOutsideSlotContent });
            document.body.appendChild(elm);

            const div = elm.shadowRoot.querySelectorAll('div');
            expect(div).toHaveSize(1);
            expect(div[0].innerHTML).toBe("90's hits");

            resetTimingBuffer();
            elm.changeLabel();
            return Promise.resolve().then(() => {
                const div = elm.shadowRoot.querySelectorAll('div');
                // verify child is rerendered
                expect(div).toHaveSize(1);
                expect(div[0].innerHTML).toBe('2000 hits');
                // verify  parent is rerendered
                expect(elm.shadowRoot.querySelector('p').innerHTML).toBe('2000 hits');
                expect(window.timingBuffer).toEqual([
                    'child:renderedCallback',
                    'parent:renderedCallback',
                ]);
            });
        });
    });

    describe('nested directives', () => {
        it('slot content can contain if:true directive and is reactive', () => {
            function verifySlotContent(expectedContent) {
                expect([...elm.shadowRoot.querySelectorAll('div')].map((_) => _.innerHTML)).toEqual(
                    expectedContent
                );
            }
            const elm = createElement('x-parent', { is: ParentWithConditionalSlotContent });
            document.body.appendChild(elm);
            const child = elm.shadowRoot.querySelector('x-child-for-conditional-slot-content');

            verifySlotContent([]);
            return Promise.resolve()
                .then(() => {
                    verifySlotContent([]);
                    // toggle visibility flag in child
                    child.visible = true;
                })
                .then(() => {
                    // Verify that parent's scoped slot content is rendered
                    verifySlotContent(['Variation 1']);

                    // Verify that slot content is reactive to changes in parent's tracked data
                    elm.enableVariation2();
                })
                .then(() => {
                    verifySlotContent(['Variation 1', 'Variation 2']);
                    // Switch of all slot content. Should still work because the vfragement still has empty text nodes that will be allocated
                    elm.disableAllVariations();
                })
                .then(() => {
                    verifySlotContent([]);

                    // toggle off visibility flag in child and verify that content is reset
                    elm.enableVariation2();
                    child.visible = false;
                })
                .then(() => {
                    verifySlotContent([]);
                });
        });
    });
});
