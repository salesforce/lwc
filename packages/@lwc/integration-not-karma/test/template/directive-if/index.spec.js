import { createElement } from 'lwc';
import XTest from 'c/test';
import XSlotted from 'c/slotted';
import NestedRenderConditional from 'c/nestedRenderConditional';
import MultipleSlot from 'c/multipleSlot';

describe('if:true directive', () => {
    it('should render if the value is truthy', () => {
        const elm = createElement('c-test', { is: XTest });
        elm.isVisible = true;
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.true')).not.toBeNull();
    });

    it('should not render if the value is falsy', () => {
        const elm = createElement('c-test', { is: XTest });
        elm.isVisible = false;
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.true')).toBeNull();
    });

    it('should remove element within a nested conditional', async () => {
        const elm = createElement('c-nested-render-conditional', { is: NestedRenderConditional });
        document.body.appendChild(elm);

        const elementToggler = elm.shadowRoot.querySelector('.click-me');

        elementToggler.click();

        await Promise.resolve();
        const elementInsideNestedCondition = elm.shadowRoot.querySelector('.toggle');
        expect(elementInsideNestedCondition).toBeNull();
    });

    it('should update if the value change', async () => {
        const elm = createElement('c-test', { is: XTest });
        elm.isVisible = true;
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.true')).not.toBeNull();

        elm.isVisible = false;
        await Promise.resolve();
        expect(elm.shadowRoot.querySelector('.true')).toBeNull();
        elm.isVisible = {};
        await Promise.resolve();
        expect(elm.shadowRoot.querySelector('.true')).not.toBeNull();
        elm.isVisible = 0;
        await Promise.resolve();
        expect(elm.shadowRoot.querySelector('.true')).toBeNull();
        elm.isVisible = 1;
        await Promise.resolve();
        expect(elm.shadowRoot.querySelector('.true')).not.toBeNull();
        elm.isVisible = null;
        await Promise.resolve();
        expect(elm.shadowRoot.querySelector('.true')).toBeNull();
        elm.isVisible = [];
        await Promise.resolve();
        expect(elm.shadowRoot.querySelector('.true')).not.toBeNull();
    });
    // In native shadow, the slotted content from parent is always queriable, its only the
    // child's <slot> that is rendered/unrendered based on the directive
    it.runIf(process.env.NATIVE_SHADOW)(
        'should update child with slot content if value changes',
        async () => {
            const elm = createElement('c-test', { is: XSlotted });
            document.body.appendChild(elm);
            const assignedSlotContent = elm.shadowRoot.querySelector('div.content');
            const child = elm.shadowRoot.querySelector('c-child');
            expect(child).not.toBeNull();
            expect(child.shadowRoot.querySelector('slot')).toBeNull();

            child.show = true;

            await Promise.resolve();
            const slot = child.shadowRoot.querySelector('slot');
            expect(slot).not.toBeNull();
            const assignedNodes = slot.assignedNodes({ flatten: true });
            expect(assignedNodes.length).toBe(1);
            expect(assignedNodes[0]).toBe(assignedSlotContent);
            child.show = false;
            await Promise.resolve();
            expect(child.shadowRoot.querySelector('slot')).toBeNull();
            child.show = true;
            await Promise.resolve();
            const slot_1 = child.shadowRoot.querySelector('slot');
            expect(slot_1).not.toBeNull();
            const assignedNodes_1 = slot_1.assignedNodes({ flatten: true });
            expect(assignedNodes_1.length).toBe(1);
            expect(assignedNodes_1[0]).toBe(assignedSlotContent);
        }
    );
    it.skipIf(process.env.NATIVE_SHADOW)(
        'should update child with slot content if value changes',
        async () => {
            const elm = createElement('c-test', { is: XSlotted });
            document.body.appendChild(elm);
            const child = elm.shadowRoot.querySelector('c-child');
            expect(child).not.toBeNull();
            expect(child.querySelector('.content')).toBeNull();

            child.show = true;

            await Promise.resolve();
            expect(child.querySelector('.content')).not.toBeNull();
            child.show = false;
            await Promise.resolve();
            expect(child.querySelector('.content')).toBeNull();
            child.show = true;
            await Promise.resolve();
            expect(child.querySelector('.content')).not.toBeNull();
        }
    );

    it('should continue rendering content for nested slots after multiple rehydrations', async () => {
        const elm = createElement('c-multiple-slot', { is: MultipleSlot });
        document.body.appendChild(elm);
        const multipleSlotLevel1 = elm.shadowRoot.querySelector('c-multiple-slot-level1');
        const textToggleButton = elm.shadowRoot.querySelector('.textToggle');

        textToggleButton.click();

        await Promise.resolve();
        const multipleSlotLevel2 = multipleSlotLevel1.shadowRoot
            .querySelector('slot')
            .assignedElements()[0];
        expect(multipleSlotLevel2.textContent).toContain('text in multiple level slot');
        // hide the slot
        textToggleButton.click();
        await Promise.resolve();
        const slotLevel1 = multipleSlotLevel1.shadowRoot.querySelector('slot');
        expect(slotLevel1).toBe(null);
        // show the slot
        textToggleButton.click();
        await Promise.resolve();
        const multipleSlotLevel2_1 = multipleSlotLevel1.shadowRoot
            .querySelector('slot')
            .assignedElements()[0];
        expect(multipleSlotLevel2_1.textContent).toContain('text in multiple level slot');
    });
});

describe('if:false directive', () => {
    it('should not render if the value is truthy', () => {
        const elm = createElement('c-test', { is: XTest });
        elm.isVisible = true;
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.false')).toBeNull();
    });

    it('should render if the value is falsy', () => {
        const elm = createElement('c-test', { is: XTest });
        elm.isVisible = false;
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.false')).not.toBeNull();
    });

    it('should update if the value change', async () => {
        const elm = createElement('c-test', { is: XTest });
        elm.isVisible = true;
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.false')).toBeNull();

        elm.isVisible = false;
        await Promise.resolve();
        expect(elm.shadowRoot.querySelector('.false')).not.toBeNull();
        elm.isVisible = {};
        await Promise.resolve();
        expect(elm.shadowRoot.querySelector('.false')).toBeNull();
        elm.isVisible = 0;
        await Promise.resolve();
        expect(elm.shadowRoot.querySelector('.false')).not.toBeNull();
        elm.isVisible = 1;
        await Promise.resolve();
        expect(elm.shadowRoot.querySelector('.false')).toBeNull();
        elm.isVisible = null;
        await Promise.resolve();
        expect(elm.shadowRoot.querySelector('.false')).not.toBeNull();
        elm.isVisible = [];
        await Promise.resolve();
        expect(elm.shadowRoot.querySelector('.false')).toBeNull();
    });
});
