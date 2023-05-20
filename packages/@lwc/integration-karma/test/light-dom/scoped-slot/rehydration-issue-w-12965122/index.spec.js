import { createElement } from 'lwc';
import Parent from 'x/parent';

// eslint-disable-next-line
fdescribe('Should clean up content between rehydration', () => {
    beforeEach(() => {
        resetTimingBuffer();
    });

    afterEach(() => {
        delete window.timingBuffer;
    });

    function resetTimingBuffer() {
        window.timingBuffer = [];
    }

    it('Issue W-12965122 automation', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        resetTimingBuffer();
        elm.flag = true;
        elm.changeAttr();
        return Promise.resolve()
            .then(() => {
                expect(window.timingBuffer).toEqual([
                    'slotted:renderedCallback',
                    'child:renderedCallback',
                    'parent:renderedCallback',
                ]);
                // reset timing buffer before next rerender
                resetTimingBuffer();
                elm.flag = false;
                elm.changeAttr();
            })
            .then(() => {
                // Prior to the bug fix, there would be one additional 'slotted:renderedCallback' entry(the leaked element)
                expect(window.timingBuffer).toEqual(['parent:renderedCallback']);
                // reset timing buffer before next rerender
                resetTimingBuffer();
                elm.flag = true;
                elm.changeAttr();
            })
            .then(() => {
                // Prior to the bug fix, there would be one additional 'slotted:renderedCallback' entry(the leaked element)
                expect(window.timingBuffer).toEqual([
                    'slotted:renderedCallback',
                    'child:renderedCallback',
                    'parent:renderedCallback',
                ]);
                // reset timing buffer before next rerender
                resetTimingBuffer();
                elm.flag = false;
                elm.changeAttr();
            })
            .then(() => {
                // Prior to the bug fix, there would be two additional 'slotted:renderedCallback' entry(the leaked elements grow)
                expect(window.timingBuffer).toEqual(['parent:renderedCallback']);
                // reset timing buffer before next rerender
                resetTimingBuffer();
                elm.flag = true;
                elm.changeAttr();
            })
            .then(() => {
                expect(window.timingBuffer).toEqual([
                    'slotted:renderedCallback',
                    'child:renderedCallback',
                    'parent:renderedCallback',
                ]);
            });
    });
});
