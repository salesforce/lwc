import { createElement } from 'lwc';
import { nativeCustomElementLifecycleEnabled } from 'test-utils';
import Parent from 'x/parent';
import LightParent from 'x/lightParent';
import Symbol from 'x/symbol';
import EmptyObject from 'x/emptyobject';
import BigintCmp from 'x/bigint';

describe('dynamic slotting', () => {
    it('should render all slots', async function () {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.textContent).toEqual(
            'Default slotNamed 1Overridden default contentBoolean slotBoolean false slotNumber slotNumberObjectFunction'
        );
    });
    describe('should handle', () => {
        let elm, childElm, defaultSlot, altSlot;
        beforeEach(() => {
            elm = createElement('x-parent', { is: Parent });
            document.body.appendChild(elm);
            childElm = elm.shadowRoot.querySelector('x-child');
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
        const elm = createElement('x-parent', { is: Parent });
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
        const elm = createElement('x-light-parent', { is: LightParent });
        document.body.appendChild(elm);
        expect(elm.textContent).toEqual('Default slotNamed 1Hi lwc');
    });

    it('should render BigInt', () => {
        const elm = createElement('x-bigint', { is: BigintCmp });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.textContent).toEqual('BigInt');
    });
    if (!nativeCustomElementLifecycleEnabled) {
        // it actually throws in this scenario as well, but in a different callstack, so we can't assert
        it('should throw on symbol', () => {
            expect(() => {
                const elm = createElement('x-symbol', { is: Symbol });
                document.body.appendChild(elm);
            }).toThrowError(/convert.*symbol.*string.*/i); // cannot convert symbol to string (and variations of this message across browsers)
        });
    }
    if (!nativeCustomElementLifecycleEnabled) {
        it('should throw on empty object', () => {
            expect(() => {
                const elm = createElement('x-emptyobject', { is: EmptyObject });
                document.body.appendChild(elm);
            }).toThrowError(TypeError);
        });
    }
});
