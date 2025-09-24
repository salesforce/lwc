import { createElement } from 'lwc';

import DynamicContainer from 'x/dynamic';
import LwcDynamicContainer from 'x/lwcDynamic';
import DynamicCtor from 'x/ctor';
import AlterCtor from 'x/alter';

import DynamicSlotted from 'x/dynamicSlotted';
import LwcDynamicSlotted from 'x/lwcDynamicSlotted';
import ContainerFoo from 'x/containerFoo';
import ContainerBar from 'x/containerBar';

import { spyConsole } from '../../../helpers/console.js';
import { registerForLoad, clearRegister } from '../../../helpers/dynamic-loader.js';

beforeEach(() => {
    clearRegister();
});

async function microTask() {
    await Promise.resolve();
}

/** Actually waits a macro-task and then a micro-task, for reasons unspecified. */
async function macroTask() {
    await new Promise(resolve => setTimeout(resolve, 0);
    await microTask();
}

// TODO [#3331]: remove lwc:dynamic portion of these tests in 246

it('should call the loader using lwc:dynamic', async () => {
    // note, using `x-` prefix instead of `x/` because these are
    // handled by `registerForLoad`
    registerForLoad('x-ctor', DynamicCtor);
    registerForLoad('x-alter', AlterCtor);

    const elm = createElement('x-dynamic', { is: LwcDynamicContainer });
    document.body.appendChild(elm);

    const child = elm.shadowRoot.querySelector('x-ctor');
    expect(child).toBeNull();
    // first rendered with ctor set to undefined (nothing)
    elm.enableCtor();

    await macroTask();

    // second rendered with ctor set to x-ctor
    const ctorElm = elm.shadowRoot.querySelector('x-ctor');
    expect(ctorElm).not.toBeNull();
    const ctorElmSpan = ctorElm.shadowRoot.querySelector('span');
    expect(ctorElmSpan).not.toBeNull();
    expect(ctorElmSpan.textContent).toBe('ctor_html');
    elm.enableAlter();

    await macroTask();

    // third rendered with ctor set to x-alter
    const alterElm = elm.shadowRoot.querySelector('x-ctor');
    expect(alterElm).not.toBeNull();
    const afterElmSpan = alterElm.shadowRoot.querySelector('span');
    expect(afterElmSpan).not.toBeNull();
    expect(afterElmSpan.textContent).toBe('alter_html');
    elm.disableAll();

    await macroTask();

    // third rendered with ctor set to null (nothing)
    expect(elm.shadowRoot.querySelector('x-ctor')).toBeNull();
});

it('should not reuse DOM elements using lwc:dynamic', async () => {
    registerForLoad('x-ctor', DynamicCtor);
    registerForLoad('x-alter', AlterCtor);

    const elm = createElement('x-dynamic', { is: LwcDynamicContainer });
    elm.enableCtor();
    document.body.appendChild(elm);

    await macroTask();

    const childElm = elm.shadowRoot.querySelector('x-ctor');
    expect(childElm).not.toBeNull();
    elm.enableAlter();

    await macroTask();

    const alterElm = elm.shadowRoot.querySelector('x-ctor');
    expect(alterElm).not.toBe(childElm);
});

it('should not cache DOM elements using lwc:dynamic', async () => {
    registerForLoad('x-ctor', DynamicCtor);
    registerForLoad('x-alter', AlterCtor);

    const elm = createElement('x-dynamic', { is: LwcDynamicContainer });
    elm.enableCtor();
    document.body.appendChild(elm);

    // from ctor to alter back to ctor, new elements should be created
    await macroTask();

    const childElm = elm.shadowRoot.querySelector('x-ctor');
    expect(childElm).not.toBeNull();
    elm.enableAlter();

    await macroTask();

    elm.enableCtor();

    await macroTask();

    const secondCtorElm = elm.shadowRoot.querySelector('x-ctor');
    expect(secondCtorElm).not.toBe(childElm);
});

describe('slotted content using lwc:dynamic', () => {
    let consoleSpy;
    beforeEach(() => {
        consoleSpy = spyConsole();
    });
    afterEach(() => {
        consoleSpy.reset();
    });

    it('reallocate slotted content after changing constructor', async () => {
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

        await microTask();

        expect(elm.shadowRoot.querySelector('[data-id="slot-default"]').assignedSlot).toBeDefined();
        expect(elm.shadowRoot.querySelector('[data-id="slot-bar"]').assignedSlot).toBeDefined();

        if (process.env.NATIVE_SHADOW) {
            // `slot-foo` is not rendered in synthetic shadow
            expect(elm.shadowRoot.querySelector('[data-id="slot-foo"]').assignedSlot).toBe(null);
        }
        expect(consoleSpy.calls.error.length).toEqual(0);
    });
});

// Using <lwc:component lwc:is={}>

it('should call the loader', async () => {
    // note, using `x-` prefix instead of `x/` because these are
    // handled by `registerForLoad`
    registerForLoad('x-ctor', DynamicCtor);
    registerForLoad('x-alter', AlterCtor);

    const elm = createElement('x-dynamic', { is: DynamicContainer });
    document.body.appendChild(elm);

    await microTask();

    const child = elm.shadowRoot.querySelector('x-ctor');
    expect(child).toBeNull();
    // first rendered with ctor set to undefined (nothing)
    elm.enableCtor();

    await macroTask();

    // second rendered with ctor set to x-ctor
    const ctorElm = elm.shadowRoot.querySelector('x-ctor');
    expect(ctorElm).not.toBeNull();
    const ctorElmSpan = ctorElm.shadowRoot.querySelector('span');
    expect(ctorElmSpan).not.toBeNull();
    expect(ctorElmSpan.textContent).toBe('ctor_html');
    elm.enableAlter();

    await macroTask();

    // third rendered with ctor set to x-alter
    const alterElm = elm.shadowRoot.querySelector('x-alter');
    expect(alterElm).not.toBeNull();
    const afterElmSpan = alterElm.shadowRoot.querySelector('span');
    expect(afterElmSpan).not.toBeNull();
    expect(afterElmSpan.textContent).toBe('alter_html');
    elm.disableAll();

    await macroTask();

    // third rendered with ctor set to null (nothing)
    expect(elm.shadowRoot.querySelector('x-ctor')).toBeNull();
});

it('should not reuse DOM elements', async () => {
    registerForLoad('x-ctor', DynamicCtor);
    registerForLoad('x-alter', AlterCtor);

    const elm = createElement('x-dynamic', { is: DynamicContainer });
    elm.enableCtor();
    document.body.appendChild(elm);

    await macroTask();
    const childElm = elm.shadowRoot.querySelector('x-ctor');
    expect(childElm).not.toBeNull();
    elm.enableAlter();
    await macroTask();
    const alterElm = elm.shadowRoot.querySelector('x-alter');
    expect(alterElm).not.toBe(childElm);
});

it('should not cache DOM elements', async () => {
    registerForLoad('x-ctor', DynamicCtor);
    registerForLoad('x-alter', AlterCtor);

    const elm = createElement('x-dynamic', { is: DynamicContainer });
    elm.enableCtor();
    document.body.appendChild(elm);
    // from ctor to alter back to ctor, new elements should be created

    await macroTask();

    const childElm = elm.shadowRoot.querySelector('x-ctor');
    expect(childElm).not.toBeNull();
    elm.enableAlter();

    await macroTask();

    elm.enableCtor();

    await macroTask();

    const secondCtorElm = elm.shadowRoot.querySelector('x-ctor');
    expect(secondCtorElm).not.toBe(childElm);
});

describe('slotted content', () => {
    let consoleSpy;
    beforeEach(() => {
        consoleSpy = spyConsole();
    });
    afterEach(() => {
        consoleSpy.reset();
    });

    it('reallocate slotted content after changing constructor', async () => {
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

        await microTask();

        expect(elm.shadowRoot.querySelector('[data-id="slot-default"]').assignedSlot).toBeDefined();
        expect(elm.shadowRoot.querySelector('[data-id="slot-bar"]').assignedSlot).toBeDefined();

        if (process.env.NATIVE_SHADOW) {
            // `slot-foo` is not rendered in synthetic shadow
            expect(elm.shadowRoot.querySelector('[data-id="slot-foo"]').assignedSlot).toBe(null);
        }
        expect(consoleSpy.calls.error.length).toEqual(0);
    });
});
