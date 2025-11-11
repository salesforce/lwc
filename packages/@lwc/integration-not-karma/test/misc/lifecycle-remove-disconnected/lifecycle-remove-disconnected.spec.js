import { createElement } from 'lwc';
import Parent from 'x/parent';
import { spyOn } from '@vitest/spy';

describe('vdom removes component while it is already disconnected', () => {
    let spy;

    beforeEach(() => {
        spy = spyOn(console, 'warn');
    });

    afterEach(() => {
        spy.mockRestore();
    });

    it('repro "must have been connected" error W-14037619', async () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        elm.showChild = true;
        document.body.removeChild(elm);

        await Promise.resolve();
        elm.showChild = false; // trigger removal while parent is disconnected

        if (
            !lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE ||
            lwcRuntimeFlags.DISABLE_DETACHED_REHYDRATION ||
            process.env.NODE_ENV === 'production'
        ) {
            expect(spy).not.toHaveBeenCalled();
        } else {
            // expected since the engine calls appendChild to a disconnected DOM node
            expect(spy).toHaveBeenCalledExactlyOnceWith(expect.any(Error));
            expect(spy).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    message: expect.stringMatching(
                        /fired a `connectedCallback` and rendered, but was not connected to the DOM/
                    ),
                })
            );
        }
    });
});
