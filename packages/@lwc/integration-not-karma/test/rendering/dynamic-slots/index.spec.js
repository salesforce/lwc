import { createElement } from 'lwc';
import Parent from 'c/parent';
import LightParent from 'c/lightParent';
import Symbol from 'c/symbol';
import EmptyObject from 'c/emptyobject';
import BigintCmp from 'c/bigint';

describe('dynamic slotting', () => {
    it('should render all slots', function () {
        const elm = createElement('c-parent', { is: Parent });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.textContent).toEqual(
            'Default slotNamed 1Overridden default contentBoolean slotBoolean false slotNumber slotNumberObjectFunction'
        );
    });
    describe('should handle', () => {
        let elm, childElm, defaultSlot, altSlot;
        beforeEach(() => {
            elm = createElement('c-parent', { is: Parent });
            document.body.appendChild(elm);
            childElm = elm.shadowRoot.querySelector('c-child');
            defaultSlot = childElm.shadowRoot.querySelector('slot:not([name])');
            altSlot = childElm.shadowRoot.querySelector('slot[name="altdefault"]');
        });
        it('undefined', function () {
            expect(defaultSlot.assignedNodes().length).toBe(1);
            expect(altSlot.assignedNodes().length).toBe(0);
        });
        it('string', async () => {
            elm.setFullSlotname();
            await Promise.resolve();
            expect(defaultSlot.assignedNodes().length).toBe(0);
            expect(altSlot.assignedNodes().length).toBe(1);
        });

        it('empty string', async () => {
            elm.setEmptyName();
            await Promise.resolve();
            expect(defaultSlot.assignedNodes().length).toBe(1);
            expect(altSlot.assignedNodes().length).toBe(0);
        });

        it('null', async () => {
            elm.setNullName();
            await Promise.resolve();
            expect(defaultSlot.assignedNodes().length).toBe(1);
            expect(altSlot.assignedNodes().length).toBe(0);
        });
    });
    it('should rerender slots', async function () {
        const elm = createElement('c-parent', { is: Parent });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.textContent).toEqual(
            'Default slotNamed 1Overridden default contentBoolean slotBoolean false slotNumber slotNumberObjectFunction'
        );

        elm.increment();
        await Promise.resolve();
        expect(elm.shadowRoot.textContent).toEqual(
            'Default slotNamed 2Overridden default contentBoolean slotBoolean false slotNumber slotNumberObjectFunction'
        ); // notice the 2 in the text
    });

    it('should render in light DOM', () => {
        const elm = createElement('c-light-parent', { is: LightParent });
        document.body.appendChild(elm);
        expect(elm.textContent).toEqual('Default slotNamed 1Hi lwc');
    });

    it('should render BigInt', () => {
        const elm = createElement('c-bigint', { is: BigintCmp });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.textContent).toEqual('BigInt');
    });

    describe.runIf(lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE)(
        'disabled native custom element lifecycle',
        () => {
            // it actually throws in this scenario as well, but in a different callstack, so we can't assert
            it('should throw on symbol', () => {
                expect(() => {
                    const elm = createElement('c-symbol', { is: Symbol });
                    document.body.appendChild(elm);
                }).toThrowError(/convert.*symbol.*string.*/i); // cannot convert symbol to string (and variations of this message across browsers)
            });

            it('should throw on empty object', () => {
                expect(() => {
                    const elm = createElement('c-emptyobject', { is: EmptyObject });
                    document.body.appendChild(elm);
                }).toThrowError(TypeError);
            });
        }
    );
});
