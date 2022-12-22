import { createElement } from 'lwc';
import Parent from 'x/parent';
import LightParent from 'x/lightParent';
import Symbol from 'x/symbol';
import EmptyObject from 'x/emptyobject';

describe('dynamic slotting', () => {
    it('should render all slots', async function () {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        expect(elm.shadowRoot.textContent).toEqual(
            'Default slotNamed 1Overridden default contentBoolean slotNumber slotNumberObjectFunctionBigint'
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
            'Default slotNamed 1Overridden default contentBoolean slotNumber slotNumberObjectFunctionBigint'
        );

        elm.increment();
        await Promise.resolve();
        expect(elm.shadowRoot.textContent).toEqual(
            'Default slotNamed 2Overridden default contentBoolean slotNumber slotNumberObjectFunctionBigint'
        ); // notice the 2 in the text
    });

    it('should render in light DOM', () => {
        const elm = createElement('x-light-parent', { is: LightParent });
        document.body.appendChild(elm);
        expect(elm.textContent).toEqual('Default slotNamed 1Hi lwc');
    });

    it('should throw on symbol', () => {
        expect(() => {
            const elm = createElement('x-symbol', { is: Symbol });
            document.body.appendChild(elm);
        }).toThrowError(/Cannot convert a Symbol value to a string/);
    });
    it('should throw on empty object', () => {
        expect(() => {
            const elm = createElement('x-emptyobject', { is: EmptyObject });
            document.body.appendChild(elm);
        }).toThrowError(/Cannot convert object to primitive value/);
    });
});
