import { createElement } from 'lwc';
import Parent from 'c/parent';

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
            [...elm.shadowRoot.querySelectorAll('c-slotted')].map((_) =>
                _.shadowRoot.innerHTML.trim()
            )
        ).toEqual(expectedContent);
    }

    it('Issue W-12965122 automation: Elements are not leaked when parent binding and child binding is mutated', async () => {
        const elm = createElement('c-parent', { is: Parent });
        document.body.appendChild(elm);
        resetTimingBuffer();
        elm.flag = true;
        elm.changeAttr(); // counter 0
        await Promise.resolve();
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
        await Promise.resolve();
        verifySlotContent(elm, []);
        // Prior to the bug fix, there would be one additional 'slotted:renderedCallback' entry(the leaked element)
        expect(window.timingBuffer).toEqual(['parent:renderedCallback']);
        // reset timing buffer before next rerender
        resetTimingBuffer();
        elm.flag = true;
        elm.changeAttr(); // counter 2
        await Promise.resolve();
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
        await Promise.resolve();
        verifySlotContent(elm, []);
        // Prior to the bug fix, there would be two additional 'slotted:renderedCallback' entry(the leaked elements grow)
        expect(window.timingBuffer).toEqual(['parent:renderedCallback']);
        // reset timing buffer before next rerender
        resetTimingBuffer();
        elm.flag = true;
        elm.changeAttr();
        await Promise.resolve();
        verifySlotContent(elm, ['Slotted content: Parent4 Fiat']);
        expect(window.timingBuffer).toEqual([
            'slotted:renderedCallback',
            'child:renderedCallback',
            'parent:renderedCallback',
        ]);
    });

    it("Should rerender when only child's value is mutated", async () => {
        const elm = createElement('c-parent', { is: Parent });
        document.body.appendChild(elm);
        resetTimingBuffer();
        elm.flag = true;
        await Promise.resolve();
        // reset timing buffer before next rerender
        resetTimingBuffer();
        // Only change child's tracked value
        elm.shadowRoot.querySelector('c-child').changeLabel();
        await Promise.resolve();
        verifySlotContent(elm, ['Slotted content: Parent Peugeot']);
        expect(window.timingBuffer).toEqual([
            'slotted:renderedCallback',
            'child:renderedCallback',
            'parent:renderedCallback',
        ]);
        resetTimingBuffer();
        elm.flag = false;
        elm.changeAttr(); // counter 3
        await Promise.resolve();
        verifySlotContent(elm, []);
        // Verify there are no dangling c-slotted
        expect(window.timingBuffer).toEqual(['parent:renderedCallback']);
    });

    it("Should rerender when child's value is mutated before parent's value is mutated", async () => {
        const elm = createElement('c-parent', { is: Parent });
        document.body.appendChild(elm);
        resetTimingBuffer();
        elm.flag = true;
        await Promise.resolve();
        elm.flag = false;
        await Promise.resolve();
        verifySlotContent(elm, []);
        elm.flag = true;
        await Promise.resolve();
        resetTimingBuffer();
        elm.shadowRoot.querySelector('c-child').changeLabel(); // Peugeot
        elm.changeAttr(); // Counter 0
        await Promise.resolve();
        verifySlotContent(elm, ['Slotted content: Parent0 Peugeot']);
        // Prior to the bug fix, there would be one additional 'slotted:renderedCallback' entry(the leaked element)
        expect(window.timingBuffer).toEqual([
            'slotted:renderedCallback',
            'child:renderedCallback',
            'parent:renderedCallback',
        ]);
    });

    it("Should rerender when child's value is mutated after then parent's value is mutated", async () => {
        const elm = createElement('c-parent', { is: Parent });
        document.body.appendChild(elm);
        resetTimingBuffer();
        elm.flag = true;
        await Promise.resolve();
        elm.flag = false;
        await Promise.resolve();
        verifySlotContent(elm, []);
        elm.flag = true;
        await Promise.resolve();
        resetTimingBuffer();
        elm.changeAttr(); // Counter 0
        elm.shadowRoot.querySelector('c-child').changeLabel(); // Peugeot
        await Promise.resolve();
        verifySlotContent(elm, ['Slotted content: Parent0 Peugeot']);
        // Prior to the bug fix, there would be one additional 'slotted:renderedCallback' entry(the leaked element)
        expect(window.timingBuffer).toEqual([
            'slotted:renderedCallback',
            'child:renderedCallback',
            'parent:renderedCallback',
        ]);
    });

    it('Should not leak slotted content if its changed by child before cleanup', async () => {
        const elm = createElement('c-parent', { is: Parent });
        document.body.appendChild(elm);
        resetTimingBuffer();
        elm.flag = true;
        await Promise.resolve();
        resetTimingBuffer();
        elm.shadowRoot.querySelector('c-child').changeLabel(); // Mutate child's value before parent turns off the branch containing c-child
        elm.flag = false; // turn off the branch
        await Promise.resolve();
        verifySlotContent(elm, []);
        // Prior to the bug fix, there would be one additional 'slotted:renderedCallback' entry(the leaked element)
        expect(window.timingBuffer).toEqual(['parent:renderedCallback']);
    });
});
