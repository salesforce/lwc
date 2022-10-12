import { createElement } from 'lwc';

import ListParentApiData from 'x/listParentApiData';
import WithParentBindings from 'x/withparentBindings';
import ParentBindingsOutsideSlotContent from 'x/parentBindingsOutsideSlotContent';
import ListParentTrackedData from 'x/listParentTrackedData';

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
        document.body.appendChild(elm);

        resetTimingBuffer();
        elm.changeItemsNestedValue();
        return Promise.resolve()
            .then(() => {
                const spans = elm.shadowRoot.querySelectorAll('span');
                expect(spans).toHaveSize(2);
                expect(spans[0].innerHTML).toBe('38 - Audio');
                expect(spans[1].innerHTML).toBe('40 - Video');
                expect(window.timingBuffer).toEqual([
                    'child:renderedCallback', // Only the child gets re-rendered
                ]);

                // reset timing buffer before next rerender
                resetTimingBuffer();
                elm.changeItemsRow();
            })
            .then(() => {
                const spans = elm.shadowRoot.querySelectorAll('span');
                expect(spans).toHaveSize(2);
                expect(spans[0].innerHTML).toBe('37 - Tape');
                expect(spans[1].innerHTML).toBe('40 - Video');
                expect(window.timingBuffer).toEqual([
                    'child:renderedCallback', // Only the child gets re-rendered
                ]);
            });
    });

    it("rerenders slotted content when mutating value of child's tracked field", () => {
        const elm = createElement('x-list-parent', { is: ListParentTrackedData });
        document.body.appendChild(elm);

        resetTimingBuffer();
        const child = elm.shadowRoot.querySelector('x-list-child-tracked-data');
        child.changeItemsNestedValue();

        return Promise.resolve()
            .then(() => {
                const spans = elm.shadowRoot.querySelectorAll('span');
                expect(spans).toHaveSize(2);
                expect(spans[0].innerHTML).toBe('38 - Audio');
                expect(spans[1].innerHTML).toBe('40 - Video');
                expect(window.timingBuffer).toEqual([
                    'child:renderedCallback', // Only the child gets re-rendered
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
                    'child:renderedCallback', // Only the child gets re-rendered
                ]);
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
                    'child:renderedCallback', // Only the child gets re-rendered
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
});
