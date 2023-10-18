import { createElement } from 'lwc';
import Parent from 'x/parent';

describe('vdom removes component while it is already disconnected', () => {
    let spy;

    beforeEach(() => {
        spy = spyOn(console, 'warn');
    });

    afterEach(() => {
        // This is an odd edge case for the synthetic lifecycle which triggers this extra connectedCallback
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.calls.mostRecent().args[0]).toMatch(
            /fired a connectedCallback when it should not have/
        );
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
