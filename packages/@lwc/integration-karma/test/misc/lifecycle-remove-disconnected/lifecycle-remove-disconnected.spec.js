import { createElement } from 'lwc';
import { nativeCustomElementLifecycleEnabled } from 'test-utils';
import Parent from 'x/parent';

describe('vdom removes component while it is already disconnected', () => {
    let spy;

    beforeEach(() => {
        spy = spyOn(console, 'warn');
    });

    afterEach(() => {
        if (nativeCustomElementLifecycleEnabled || process.env.NODE_ENV === 'production') {
            expect(spy).not.toHaveBeenCalled();
        } else {
            // expected since the engine calls appendChild to a disconnected DOM node
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy.calls.mostRecent().args[0]).toMatch(
                /fired a `connectedCallback` and rendered, but was not connected to the DOM/
            );
        }
    });

    it('repro "must have been connected" error W-14037619', async () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        elm.showChild = true;
        document.body.removeChild(elm);

        await Promise.resolve();
        elm.showChild = false; // trigger removal while parent is disconnected
    });
});
