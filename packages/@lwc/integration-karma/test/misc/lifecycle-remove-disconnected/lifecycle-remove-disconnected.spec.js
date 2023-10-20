import { createElement } from 'lwc';
import Parent from 'x/parent';

describe('vdom removes component while it is already disconnected', () => {
    it('repro "must have been connected" error W-14037619', async () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        elm.showChild = true;
        document.body.removeChild(elm);

        await Promise.resolve();
        elm.showChild = false; // trigger removal while parent is disconnected
    });
});
