import { createElement } from 'lwc';

import DynamicContainer from 'x/dynamic';
import LwcDynamicContainer from 'x/lwcDynamic';
import DynamicCtor from 'x/ctor';
import AlterCtor from 'x/alter';

import DynamicSlotted from 'x/dynamicSlotted';
import LwcDynamicSlotted from 'x/lwcDynamicSlotted';
import ContainerFoo from 'x/containerFoo';
import ContainerBar from 'x/containerBar';

import { registerForLoad, clearRegister, spyConsole } from 'test-utils';

beforeEach(() => {
    clearRegister();
});

function waitForMacroTask(fn) {
    // waiting for the macro-task first, then micro-task
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        });
    }).then(() => fn());
}

// TODO [#3331]: remove lwc:dynamic portion of these tests in 246

it('should call the loader using lwc:dynamic', () => {
    // note, using `x-` prefix instead of `x/` because these are
    // handled by `registerForLoad`
    registerForLoad('x-ctor', DynamicCtor);
    registerForLoad('x-alter', AlterCtor);

    const elm = createElement('x-dynamic', { is: LwcDynamicContainer });
    document.body.appendChild(elm);

    return Promise.resolve().then(() => {
        const child = elm.shadowRoot.querySelector('x-ctor');
        expect(child).toBeNull();
        // first rendered with ctor set to undefined (nothing)
        elm.enableCtor();
        return waitForMacroTask(() => {
            // second rendered with ctor set to x-ctor
            const ctorElm = elm.shadowRoot.querySelector('x-ctor');
            expect(ctorElm).not.toBeNull();
            const span = ctorElm.shadowRoot.querySelector('span');
            expect(span).not.toBeNull();
            expect(span.textContent).toBe('ctor_html');
            elm.enableAlter();
            return waitForMacroTask(() => {
                // third rendered with ctor set to x-alter
                const alterElm = elm.shadowRoot.querySelector('x-ctor');
                expect(alterElm).not.toBeNull();
                const span = alterElm.shadowRoot.querySelector('span');
                expect(span).not.toBeNull();
                expect(span.textContent).toBe('alter_html');
                elm.disableAll();
                return waitForMacroTask(() => {
                    // third rendered with ctor set to null (nothing)
                    const child = elm.shadowRoot.querySelector('x-ctor');
                    expect(child).toBeNull();
                });
            });
        });
    });
});

it('should not reuse DOM elements using lwc:dynamic', () => {
    registerForLoad('x-ctor', DynamicCtor);
    registerForLoad('x-alter', AlterCtor);

    const elm = createElement('x-dynamic', { is: LwcDynamicContainer });
    elm.enableCtor();
    document.body.appendChild(elm);

    return waitForMacroTask(() => {
        const childElm = elm.shadowRoot.querySelector('x-ctor');
        expect(childElm).not.toBeNull();
        elm.enableAlter();
        return waitForMacroTask(() => {
            const alterElm = elm.shadowRoot.querySelector('x-ctor');
            expect(alterElm).not.toBe(childElm);
        });
    });
});

it('should not cache DOM elements using lwc:dynamic', () => {
    registerForLoad('x-ctor', DynamicCtor);
    registerForLoad('x-alter', AlterCtor);

    const elm = createElement('x-dynamic', { is: LwcDynamicContainer });
    elm.enableCtor();
    document.body.appendChild(elm);

    // from ctor to alter back to ctor, new elements should be created
    return waitForMacroTask(() => {
        const childElm = elm.shadowRoot.querySelector('x-ctor');
        expect(childElm).not.toBeNull();
        elm.enableAlter();
        return waitForMacroTask(() => {
            elm.enableCtor();
            return waitForMacroTask(() => {
                const secondCtorElm = elm.shadowRoot.querySelector('x-ctor');
                expect(secondCtorElm).not.toBe(childElm);
            });
        });
    });
});

describe('slotted content using lwc:dynamic', () => {
    let consoleSpy;
    beforeEach(() => {
        consoleSpy = spyConsole();
    });
    afterEach(() => {
        consoleSpy.reset();
    });

    it('reallocate slotted content after changing constructor', () => {
        const elm = createElement('x-dynamic-slotted', { is: LwcDynamicSlotted });
        elm.ctor = ContainerFoo;

        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('[data-id="slot-default"]').assignedSlot).toBeDefined();
        expect(elm.shadowRoot.querySelector('[data-id="slot-foo"]').assignedSlot).toBeDefined();

        if (process.env.NATIVE_SHADOW) {
            // `slot-bar` is not rendered in synthetic shadow
            expect(elm.shadowRoot.querySelector('[data-id="slot-bar"]').assignedSlot).toBe(null);
        }
        expect(consoleSpy.calls.error.length).toEqual(0);

        // Swap construstor and check if nodes have been reallocated.
        elm.ctor = ContainerBar;

        return Promise.resolve().then(() => {
            expect(
                elm.shadowRoot.querySelector('[data-id="slot-default"]').assignedSlot
            ).toBeDefined();
            expect(elm.shadowRoot.querySelector('[data-id="slot-bar"]').assignedSlot).toBeDefined();

            if (process.env.NATIVE_SHADOW) {
                // `slot-foo` is not rendered in synthetic shadow
                expect(elm.shadowRoot.querySelector('[data-id="slot-foo"]').assignedSlot).toBe(
                    null
                );
            }
            expect(consoleSpy.calls.error.length).toEqual(0);
        });
    });
});

// Using <lwc:component lwc:is={}>

it('should call the loader', () => {
    // note, using `x-` prefix instead of `x/` because these are
    // handled by `registerForLoad`
    registerForLoad('x-ctor', DynamicCtor);
    registerForLoad('x-alter', AlterCtor);

    const elm = createElement('x-dynamic', { is: DynamicContainer });
    document.body.appendChild(elm);

    return Promise.resolve().then(() => {
        const child = elm.shadowRoot.querySelector('x-ctor');
        expect(child).toBeNull();
        // first rendered with ctor set to undefined (nothing)
        elm.enableCtor();
        return waitForMacroTask(() => {
            // second rendered with ctor set to x-ctor
            const ctorElm = elm.shadowRoot.querySelector('x-ctor');
            expect(ctorElm).not.toBeNull();
            const span = ctorElm.shadowRoot.querySelector('span');
            expect(span).not.toBeNull();
            expect(span.textContent).toBe('ctor_html');
            elm.enableAlter();
            return waitForMacroTask(() => {
                // third rendered with ctor set to x-alter
                const alterElm = elm.shadowRoot.querySelector('x-alter');
                expect(alterElm).not.toBeNull();
                const span = alterElm.shadowRoot.querySelector('span');
                expect(span).not.toBeNull();
                expect(span.textContent).toBe('alter_html');
                elm.disableAll();
                return waitForMacroTask(() => {
                    // third rendered with ctor set to null (nothing)
                    const child = elm.shadowRoot.querySelector('x-ctor');
                    expect(child).toBeNull();
                });
            });
        });
    });
});

it('should not reuse DOM elements', () => {
    registerForLoad('x-ctor', DynamicCtor);
    registerForLoad('x-alter', AlterCtor);

    const elm = createElement('x-dynamic', { is: DynamicContainer });
    elm.enableCtor();
    document.body.appendChild(elm);

    return waitForMacroTask(() => {
        const childElm = elm.shadowRoot.querySelector('x-ctor');
        expect(childElm).not.toBeNull();
        elm.enableAlter();
        return waitForMacroTask(() => {
            const alterElm = elm.shadowRoot.querySelector('x-alter');
            expect(alterElm).not.toBe(childElm);
        });
    });
});

it('should not cache DOM elements', () => {
    registerForLoad('x-ctor', DynamicCtor);
    registerForLoad('x-alter', AlterCtor);

    const elm = createElement('x-dynamic', { is: DynamicContainer });
    elm.enableCtor();
    document.body.appendChild(elm);

    // from ctor to alter back to ctor, new elements should be created
    return waitForMacroTask(() => {
        const childElm = elm.shadowRoot.querySelector('x-ctor');
        expect(childElm).not.toBeNull();
        elm.enableAlter();
        return waitForMacroTask(() => {
            elm.enableCtor();
            return waitForMacroTask(() => {
                const secondCtorElm = elm.shadowRoot.querySelector('x-ctor');
                expect(secondCtorElm).not.toBe(childElm);
            });
        });
    });
});

describe('slotted content', () => {
    let consoleSpy;
    beforeEach(() => {
        consoleSpy = spyConsole();
    });
    afterEach(() => {
        consoleSpy.reset();
    });

    it('reallocate slotted content after changing constructor', () => {
        const elm = createElement('x-dynamic-slotted', { is: DynamicSlotted });
        elm.ctor = ContainerFoo;

        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('[data-id="slot-default"]').assignedSlot).toBeDefined();
        expect(elm.shadowRoot.querySelector('[data-id="slot-foo"]').assignedSlot).toBeDefined();

        if (process.env.NATIVE_SHADOW) {
            // `slot-bar` is not rendered in synthetic shadow
            expect(elm.shadowRoot.querySelector('[data-id="slot-bar"]').assignedSlot).toBe(null);
        }
        expect(consoleSpy.calls.error.length).toEqual(0);

        // Swap constructor and check if nodes have been reallocated.
        elm.ctor = ContainerBar;

        return Promise.resolve().then(() => {
            expect(
                elm.shadowRoot.querySelector('[data-id="slot-default"]').assignedSlot
            ).toBeDefined();
            expect(elm.shadowRoot.querySelector('[data-id="slot-bar"]').assignedSlot).toBeDefined();

            if (process.env.NATIVE_SHADOW) {
                // `slot-foo` is not rendered in synthetic shadow
                expect(elm.shadowRoot.querySelector('[data-id="slot-foo"]').assignedSlot).toBe(
                    null
                );
            }
            expect(consoleSpy.calls.error.length).toEqual(0);
        });
    });
});
