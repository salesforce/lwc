import { createElement } from 'lwc';
import Parent from 'x/parent';

describe('Should clean up content between rehydration', () => {
    beforeEach(() => {
        resetTimingBuffer();
    });

    afterEach(() => {
        delete window.timingBuffer;
    });

    function resetTimingBuffer() {
        window.timingBuffer = [];
    }

    function verifySlotContent(elm, expectedContent) {
        expect(
            [...elm.shadowRoot.querySelectorAll('x-slotted')].map((_) =>
                _.shadowRoot.innerHTML.trim()
            )
        ).toEqual(expectedContent);
    }

    it('Issue W-12965122 automation: Elements are not leaked when parent binding and child binding is mutated', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        resetTimingBuffer();
        elm.flag = true;
        elm.changeAttr(); // counter 0
        return Promise.resolve()
            .then(() => {
                verifySlotContent(elm, ['Slotted content: Parent0 Fiat']);
                expect(window.timingBuffer).toEqual([
                    'slotted:renderedCallback',
                    'child:renderedCallback',
                    'parent:renderedCallback',
                ]);
                // reset timing buffer before next rerender
                resetTimingBuffer();
                elm.flag = false;
                elm.changeAttr(); // counter 1
            })
            .then(() => {
                verifySlotContent(elm, []);
                // Prior to the bug fix, there would be one additional 'slotted:renderedCallback' entry(the leaked element)
                expect(window.timingBuffer).toEqual(['parent:renderedCallback']);
                // reset timing buffer before next rerender
                resetTimingBuffer();
                elm.flag = true;
                elm.changeAttr(); // counter 2
            })
            .then(() => {
                verifySlotContent(elm, ['Slotted content: Parent2 Fiat']);
                // Prior to the bug fix, there would be one additional 'slotted:renderedCallback' entry(the leaked element)
                expect(window.timingBuffer).toEqual([
                    'slotted:renderedCallback',
                    'child:renderedCallback',
                    'parent:renderedCallback',
                ]);
                // reset timing buffer before next rerender
                resetTimingBuffer();
                elm.flag = false;
                elm.changeAttr(); // counter 3
            })
            .then(() => {
                verifySlotContent(elm, []);
                // Prior to the bug fix, there would be two additional 'slotted:renderedCallback' entry(the leaked elements grow)
                expect(window.timingBuffer).toEqual(['parent:renderedCallback']);
                // reset timing buffer before next rerender
                resetTimingBuffer();
                elm.flag = true;
                elm.changeAttr();
            })
            .then(() => {
                verifySlotContent(elm, ['Slotted content: Parent4 Fiat']);
                expect(window.timingBuffer).toEqual([
                    'slotted:renderedCallback',
                    'child:renderedCallback',
                    'parent:renderedCallback',
                ]);
            });
    });

    it("Should rerender when only child's value is mutated", () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        resetTimingBuffer();
        elm.flag = true;
        return Promise.resolve()
            .then(() => {
                // reset timing buffer before next rerender
                resetTimingBuffer();
                // Only change child's tracked value
                elm.shadowRoot.querySelector('x-child').changeLabel();
            })
            .then(() => {
                verifySlotContent(elm, ['Slotted content: Parent Peugeot']);
                expect(window.timingBuffer).toEqual([
                    'slotted:renderedCallback',
                    'child:renderedCallback',
                    'parent:renderedCallback',
                ]);
                resetTimingBuffer();
                elm.flag = false;
                elm.changeAttr(); // counter 3
            })
            .then(() => {
                verifySlotContent(elm, []);
                // Verify there are no dangling x-slotted
                expect(window.timingBuffer).toEqual(['parent:renderedCallback']);
            });
    });

    it("Should rerender when child's value is mutated before parent's value is mutated", () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        resetTimingBuffer();
        elm.flag = true;
        return Promise.resolve()
            .then(() => {
                elm.flag = false;
            })
            .then(() => {
                verifySlotContent(elm, []);
                elm.flag = true;
            })
            .then(() => {
                resetTimingBuffer();
                elm.shadowRoot.querySelector('x-child').changeLabel(); // Peugeot
                elm.changeAttr(); // Counter 0
            })
            .then(() => {
                verifySlotContent(elm, ['Slotted content: Parent0 Peugeot']);
                // Prior to the bug fix, there would be one additional 'slotted:renderedCallback' entry(the leaked element)
                expect(window.timingBuffer).toEqual([
                    'slotted:renderedCallback',
                    'child:renderedCallback',
                    'parent:renderedCallback',
                ]);
            });
    });

    it("Should rerender when child's value is mutated after then parent's value is mutated", () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        resetTimingBuffer();
        elm.flag = true;
        return Promise.resolve()
            .then(() => {
                elm.flag = false;
            })
            .then(() => {
                verifySlotContent(elm, []);
                elm.flag = true;
            })
            .then(() => {
                resetTimingBuffer();
                elm.changeAttr(); // Counter 0
                elm.shadowRoot.querySelector('x-child').changeLabel(); // Peugeot
            })
            .then(() => {
                verifySlotContent(elm, ['Slotted content: Parent0 Peugeot']);
                // Prior to the bug fix, there would be one additional 'slotted:renderedCallback' entry(the leaked element)
                expect(window.timingBuffer).toEqual([
                    'slotted:renderedCallback',
                    'child:renderedCallback',
                    'parent:renderedCallback',
                ]);
            });
    });

    it('Should not leak slotted content if its changed by child before cleanup', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        resetTimingBuffer();
        elm.flag = true;
        return Promise.resolve()
            .then(() => {
                resetTimingBuffer();
                elm.shadowRoot.querySelector('x-child').changeLabel(); // Mutate child's value before parent turns off the branch containing x-child
                elm.flag = false; // turn off the branch
            })
            .then(() => {
                verifySlotContent(elm, []);
                // Prior to the bug fix, there would be one additional 'slotted:renderedCallback' entry(the leaked element)
                expect(window.timingBuffer).toEqual(['parent:renderedCallback']);
            });
    });
});
