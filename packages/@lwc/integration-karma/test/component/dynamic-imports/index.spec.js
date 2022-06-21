import { createElement } from 'lwc';
import Container from 'x/dynamic';
import DynamicCtor from 'x/ctor';
import AlterCtor from 'x/alter';
import { registerForLoad, clearRegister } from 'test-utils';

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

it('should call the loader', () => {
    // note, using `x-` prefix instead of `x/` because these are
    // handled by `registerForLoad`
    registerForLoad('x-ctor', DynamicCtor);
    registerForLoad('x-alter', AlterCtor);

    const elm = createElement('x-dynamic', { is: Container });
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

it('should not reuse DOM elements', () => {
    registerForLoad('x-ctor', DynamicCtor);
    registerForLoad('x-alter', AlterCtor);

    const elm = createElement('x-dynamic', { is: Container });
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

it('should not cache DOM elements', () => {
    registerForLoad('x-ctor', DynamicCtor);
    registerForLoad('x-alter', AlterCtor);

    const elm = createElement('x-dynamic', { is: Container });
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
