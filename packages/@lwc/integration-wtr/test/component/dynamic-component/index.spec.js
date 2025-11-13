import { createElement } from 'lwc';
import Attributes from 'x/attributes';
import Basic from 'x/basic';
import Slotter from 'x/slotter';
import List from 'x/list';
import Nested from 'x/nested';
import ScopedSlotParent from 'x/scopedSlotParent';
import ForwardedScopedSlotParent from 'x/forwardedScopedSlotParent';
import Conditional from 'x/conditional';

describe('dynamic components', () => {
    it('basic dynamic component', async () => {
        const elm = createElement('x-basic', { is: Basic });
        document.body.appendChild(elm);

        await Promise.resolve();
        // Constructor not set
        const children = elm.shadowRoot.children;
        expect(children.length).toBe(0);
        elm.loadFoo();
        await Promise.resolve();
        // Set constructor to foo
        const children_1 = elm.shadowRoot.children;
        expect(children_1.length).toBe(1);
        expect(children_1[0].tagName.toLowerCase()).toBe('x-foo');
        elm.loadBar();
        await Promise.resolve();
        // Change constructor to bar
        const children_2 = elm.shadowRoot.children;
        expect(children_2.length).toBe(1);
        expect(children_2[0].tagName.toLowerCase()).toBe('x-bar');
        elm.clearCtor();
        await Promise.resolve();
        // Change constructor to null
        const children_3 = elm.shadowRoot.children;
        expect(children_3.length).toBe(0);
    });

    it('attributes assigned to dynamic components', async () => {
        const elm = createElement('x-attributes', { is: Attributes });
        document.body.appendChild(elm);

        await Promise.resolve();
        const foo = elm.shadowRoot.querySelector('x-foo');
        const bar = elm.shadowRoot.querySelector('x-bar');
        expect(foo).not.toBeNull();
        expect(bar).not.toBeNull();
        // declaratively assigned
        expect(foo.className).toContain('slds-snazzy');
        expect(elm.clickEvtSrcElement).toBeNull();
        foo.click();
        expect(elm.clickEvtSrcElement).toBe('x-foo');
        // imperatively assigned
        expect(bar.className).toContain('slds-more-snazzy');
        bar.click();
        expect(elm.clickEvtSrcElement).toBe('x-bar');
    });

    describe('dynamic list', () => {
        let container;

        beforeEach(() => {
            container = createElement('x-list', { is: List });
            document.body.appendChild(container);
            // Wait for microtask queue
            return Promise.resolve();
        });

        const verifyListContent = (expectedChildren) => {
            const actualChildren = Array.from(container.shadowRoot.children).map((_) =>
                _.tagName.toLowerCase()
            );
            expect(actualChildren).toEqual(expectedChildren);
        };

        it('renders the components in the correct order', () => {
            // Original order at creation time
            verifyListContent(['x-foo', 'x-bar', 'x-baz', 'x-fred']);
        });

        it('maintains correct order when constructor assigned to each item in the list changes', async () => {
            container.swapConstructors();
            await Promise.resolve();
            // New order after each item changes constructor
            verifyListContent(['x-baz', 'x-fred', 'x-foo', 'x-bar']);
        });

        it('renders components in correct order when constructors are removed', async () => {
            container.removeConstructors();
            await Promise.resolve();
            // Set 2 of the constructors to null
            verifyListContent(['x-bar', 'x-fred']);
        });
    });

    describe('slots', () => {
        let container;

        beforeEach(() => {
            container = createElement('x-slotter', { is: Slotter });
            document.body.appendChild(container);
            // Wait for microtask queue
            return Promise.resolve();
        });

        it('properly renders default slot', () => {
            const dynamicElm = container.shadowRoot.querySelector('x-slottable');
            expect(dynamicElm).not.toBeNull();

            const slot = dynamicElm.shadowRoot.querySelector('slot');
            const assignedElements = slot.assignedElements();
            expect(assignedElements.length).toBe(1);
            expect(assignedElements[0].getAttribute('data-slot-id')).toBe('default');
        });

        it('properly renders named slot', () => {
            const dynamicElm = container.shadowRoot.querySelector('x-slottable');
            expect(dynamicElm).not.toBeNull();

            const slot = dynamicElm.shadowRoot.querySelector("slot[name='slot1']");
            const assignedElements = slot.assignedElements();
            expect(assignedElements.length).toBe(1);
            expect(assignedElements[0].getAttribute('data-slot-id')).toBe('slot1');
        });
    });

    describe('nested dynamic components', () => {
        let container;

        beforeEach(() => {
            container = createElement('x-nested-slotter', { is: Nested });
            document.body.appendChild(container);
        });

        it('renders parent dynamic component without children', async () => {
            container.loadParent();
            await Promise.resolve();
            const parent = container.shadowRoot.querySelector('x-slottable');
            expect(parent).not.toBeNull();
            const child = container.shadowRoot.querySelector('x-foo');
            expect(child).toBeNull();
        });

        it('renders parent and child dynamic elements properly', async () => {
            container.loadParent();
            container.loadChild();
            await Promise.resolve();
            const parent = container.shadowRoot.querySelector('x-slottable');
            expect(parent).not.toBeNull();
            const child = container.shadowRoot.querySelector('x-foo');
            expect(child).not.toBeNull();
        });

        it('does not render children when parent does not have constructor', async () => {
            container.loadChild();
            await Promise.resolve();
            const parent = container.shadowRoot.querySelector('x-slottable');
            expect(parent).toBeNull();
            const child = container.shadowRoot.querySelector('x-foo');
            expect(child).toBeNull();
        });
    });

    describe('scoped slots', () => {
        it('properly renders dynamic components when constructor is passed from slot child to parent', async () => {
            const elm = createElement('x-scoped-slot-parent', { is: ScopedSlotParent });
            document.body.appendChild(elm);
            await Promise.resolve();
            const childSlot = elm.shadowRoot.querySelector('x-scoped-slot-child');
            expect(childSlot).not.toBeNull();
            const slottedContent = childSlot.children;
            expect(slottedContent.length).toBe(3);
            expect(slottedContent[0].tagName.toLowerCase()).toBe('x-foo');
            expect(slottedContent[1].tagName.toLowerCase()).toBe('x-bar');
            expect(slottedContent[2].tagName.toLowerCase()).toBe('x-fred');
        });

        it('properly renders slotted content inside a dynamically created scoped slot child', async () => {
            const elm = createElement('x-forwarded-scoped-slot-parent', {
                is: ForwardedScopedSlotParent,
            });
            document.body.appendChild(elm);
            await Promise.resolve();
            const childSlot = elm.shadowRoot.querySelector('x-forwarded-scoped-slot-child');
            expect(childSlot).not.toBeNull();
            const slottedContent = childSlot.querySelector('x-baz');
            expect(slottedContent).not.toBeNull();
        });
    });

    describe('conditional rendering', () => {
        let container;

        beforeEach(() => {
            container = createElement('x-container', { is: Conditional });
            document.body.appendChild(container);
        });

        it('properly renders inside lwc:if', async () => {
            expect(container.shadowRoot.children.length).toBe(0);
            container.setIfCtor();
            await Promise.resolve();
            // Does not render until if condition is met
            expect(container.shadowRoot.children.length).toBe(0);
            container.showIf = true;
            await Promise.resolve();
            const children = container.shadowRoot.children;
            expect(children.length).toBe(1);
            expect(children[0].tagName.toLowerCase()).toBe('x-foo');
        });

        it('properly renders inside lwc:elseif', async () => {
            expect(container.shadowRoot.children.length).toBe(0);
            container.setElseIfCtor();
            await Promise.resolve();
            // Does not render until elseif condition is met
            expect(container.shadowRoot.children.length).toBe(0);
            container.showElseIf = true;
            await Promise.resolve();
            const children = container.shadowRoot.children;
            expect(children.length).toBe(1);
            expect(children[0].tagName.toLowerCase()).toBe('x-bar');
        });

        it('properly renders inside lwc:else', async () => {
            expect(container.shadowRoot.children.length).toBe(0);
            container.setElseCtor();
            await Promise.resolve();
            const children = container.shadowRoot.children;
            expect(children.length).toBe(1);
            expect(children[0].tagName.toLowerCase()).toBe('x-baz');
        });
    });
});
