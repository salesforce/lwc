import { createElement } from 'lwc';

import DynamicContainer from 'c/dynamic';
import LwcDynamicContainer from 'c/lwcDynamic';
import DynamicCtor from 'c/ctor';
import AlterCtor from 'c/alter';

import DynamicSlotted from 'c/dynamicSlotted';
import LwcDynamicSlotted from 'c/lwcDynamicSlotted';
import ContainerFoo from 'c/containerFoo';
import ContainerBar from 'c/containerBar';

import { spyOn } from '@vitest/spy';
import { registerForLoad, clearRegister } from '../../../helpers/dynamic-loader.js';

beforeEach(() => {
    clearRegister();
});

async function microTask() {
    await Promise.resolve();
}

/** Actually waits a macro-task and then a micro-task, for reasons unspecified. */
async function macroTask() {
    await new Promise((resolve) => setTimeout(resolve, 0));
    await microTask();
}

// TODO [#3331]: remove lwc:dynamic portion of these tests in 246

it('should call the loader using lwc:dynamic', async () => {
    // note, using `c-` prefix instead of `c/` because these are
    // handled by `registerForLoad`
    registerForLoad('c-ctor', DynamicCtor);
    registerForLoad('c-alter', AlterCtor);

    const elm = createElement('c-dynamic', { is: LwcDynamicContainer });
    document.body.appendChild(elm);

    const child = elm.shadowRoot.querySelector('c-ctor');
    expect(child).toBeNull();
    // first rendered with ctor set to undefined (nothing)
    elm.enableCtor();

    await macroTask();

    // second rendered with ctor set to c-ctor
    const ctorElm = elm.shadowRoot.querySelector('c-ctor');
    expect(ctorElm).not.toBeNull();
    const ctorElmSpan = ctorElm.shadowRoot.querySelector('span');
    expect(ctorElmSpan).not.toBeNull();
    expect(ctorElmSpan.textContent).toBe('ctor_html');
    elm.enableAlter();

    await macroTask();

    // third rendered with ctor set to c-alter
    const alterElm = elm.shadowRoot.querySelector('c-ctor');
    expect(alterElm).not.toBeNull();
    const afterElmSpan = alterElm.shadowRoot.querySelector('span');
    expect(afterElmSpan).not.toBeNull();
    expect(afterElmSpan.textContent).toBe('alter_html');
    elm.disableAll();

    await macroTask();

    // third rendered with ctor set to null (nothing)
    expect(elm.shadowRoot.querySelector('c-ctor')).toBeNull();
});

it('should not reuse DOM elements using lwc:dynamic', async () => {
    registerForLoad('c-ctor', DynamicCtor);
    registerForLoad('c-alter', AlterCtor);

    const elm = createElement('c-dynamic', { is: LwcDynamicContainer });
    elm.enableCtor();
    document.body.appendChild(elm);

    await macroTask();

    const childElm = elm.shadowRoot.querySelector('c-ctor');
    expect(childElm).not.toBeNull();
    elm.enableAlter();

    await macroTask();

    const alterElm = elm.shadowRoot.querySelector('c-ctor');
    expect(alterElm).not.toBe(childElm);
});

it('should not cache DOM elements using lwc:dynamic', async () => {
    registerForLoad('c-ctor', DynamicCtor);
    registerForLoad('c-alter', AlterCtor);

    const elm = createElement('c-dynamic', { is: LwcDynamicContainer });
    elm.enableCtor();
    document.body.appendChild(elm);

    // from ctor to alter back to ctor, new elements should be created
    await macroTask();

    const childElm = elm.shadowRoot.querySelector('c-ctor');
    expect(childElm).not.toBeNull();
    elm.enableAlter();

    await macroTask();

    elm.enableCtor();

    await macroTask();

    const secondCtorElm = elm.shadowRoot.querySelector('c-ctor');
    expect(secondCtorElm).not.toBe(childElm);
});

describe('slotted content using lwc:dynamic', () => {
    let consoleSpy;
    beforeAll(() => {
        consoleSpy = spyOn(console, 'error');
    });
    afterAll(() => consoleSpy.mockRestore());

    it('reallocate slotted content after changing constructor', async () => {
        const elm = createElement('c-dynamic-slotted', { is: LwcDynamicSlotted });
        elm.ctor = ContainerFoo;

        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('[data-id="slot-default"]').assignedSlot).toBeDefined();
        expect(elm.shadowRoot.querySelector('[data-id="slot-foo"]').assignedSlot).toBeDefined();

        if (process.env.NATIVE_SHADOW) {
            // `slot-bar` is not rendered in synthetic shadow
            expect(elm.shadowRoot.querySelector('[data-id="slot-bar"]').assignedSlot).toBe(null);
        }
        expect(consoleSpy).not.toHaveBeenCalled();

        // Swap construstor and check if nodes have been reallocated.
        elm.ctor = ContainerBar;

        await microTask();

        expect(elm.shadowRoot.querySelector('[data-id="slot-default"]').assignedSlot).toBeDefined();
        expect(elm.shadowRoot.querySelector('[data-id="slot-bar"]').assignedSlot).toBeDefined();

        if (process.env.NATIVE_SHADOW) {
            // `slot-foo` is not rendered in synthetic shadow
            expect(elm.shadowRoot.querySelector('[data-id="slot-foo"]').assignedSlot).toBe(null);
        }
        expect(consoleSpy).not.toHaveBeenCalled();
    });
});

// Using <lwc:component lwc:is={}>

it('should call the loader', async () => {
    // note, using `c-` prefix instead of `c/` because these are
    // handled by `registerForLoad`
    registerForLoad('c-ctor', DynamicCtor);
    registerForLoad('c-alter', AlterCtor);

    const elm = createElement('c-dynamic', { is: DynamicContainer });
    document.body.appendChild(elm);

    await microTask();

    const child = elm.shadowRoot.querySelector('c-ctor');
    expect(child).toBeNull();
    // first rendered with ctor set to undefined (nothing)
    elm.enableCtor();

    await macroTask();

    // second rendered with ctor set to c-ctor
    const ctorElm = elm.shadowRoot.querySelector('c-ctor');
    expect(ctorElm).not.toBeNull();
    const ctorElmSpan = ctorElm.shadowRoot.querySelector('span');
    expect(ctorElmSpan).not.toBeNull();
    expect(ctorElmSpan.textContent).toBe('ctor_html');
    elm.enableAlter();

    await macroTask();

    // third rendered with ctor set to c-alter
    const alterElm = elm.shadowRoot.querySelector('c-alter');
    expect(alterElm).not.toBeNull();
    const afterElmSpan = alterElm.shadowRoot.querySelector('span');
    expect(afterElmSpan).not.toBeNull();
    expect(afterElmSpan.textContent).toBe('alter_html');
    elm.disableAll();

    await macroTask();

    // third rendered with ctor set to null (nothing)
    expect(elm.shadowRoot.querySelector('c-ctor')).toBeNull();
});

it('should not reuse DOM elements', async () => {
    registerForLoad('c-ctor', DynamicCtor);
    registerForLoad('c-alter', AlterCtor);

    const elm = createElement('c-dynamic', { is: DynamicContainer });
    elm.enableCtor();
    document.body.appendChild(elm);

    await macroTask();
    const childElm = elm.shadowRoot.querySelector('c-ctor');
    expect(childElm).not.toBeNull();
    elm.enableAlter();
    await macroTask();
    const alterElm = elm.shadowRoot.querySelector('c-alter');
    expect(alterElm).not.toBe(childElm);
});

it('should not cache DOM elements', async () => {
    registerForLoad('c-ctor', DynamicCtor);
    registerForLoad('c-alter', AlterCtor);

    const elm = createElement('c-dynamic', { is: DynamicContainer });
    elm.enableCtor();
    document.body.appendChild(elm);
    // from ctor to alter back to ctor, new elements should be created

    await macroTask();

    const childElm = elm.shadowRoot.querySelector('c-ctor');
    expect(childElm).not.toBeNull();
    elm.enableAlter();

    await macroTask();

    elm.enableCtor();

    await macroTask();

    const secondCtorElm = elm.shadowRoot.querySelector('c-ctor');
    expect(secondCtorElm).not.toBe(childElm);
});

describe('slotted content', () => {
    let consoleSpy;
    beforeAll(() => {
        consoleSpy = spyOn(console, 'error');
    });
    afterAll(() => consoleSpy.mockRestore());

    it('reallocate slotted content after changing constructor', async () => {
        const elm = createElement('c-dynamic-slotted', { is: DynamicSlotted });
        elm.ctor = ContainerFoo;

        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('[data-id="slot-default"]').assignedSlot).toBeDefined();
        expect(elm.shadowRoot.querySelector('[data-id="slot-foo"]').assignedSlot).toBeDefined();

        if (process.env.NATIVE_SHADOW) {
            // `slot-bar` is not rendered in synthetic shadow
            expect(elm.shadowRoot.querySelector('[data-id="slot-bar"]').assignedSlot).toBe(null);
        }
        expect(consoleSpy).not.toHaveBeenCalled();

        // Swap constructor and check if nodes have been reallocated.
        elm.ctor = ContainerBar;

        await microTask();

        expect(elm.shadowRoot.querySelector('[data-id="slot-default"]').assignedSlot).toBeDefined();
        expect(elm.shadowRoot.querySelector('[data-id="slot-bar"]').assignedSlot).toBeDefined();

        if (process.env.NATIVE_SHADOW) {
            // `slot-foo` is not rendered in synthetic shadow
            expect(elm.shadowRoot.querySelector('[data-id="slot-foo"]').assignedSlot).toBe(null);
        }
        expect(consoleSpy).not.toHaveBeenCalled();
    });
});
