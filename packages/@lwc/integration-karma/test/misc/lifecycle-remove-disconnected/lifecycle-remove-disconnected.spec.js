import { createElement } from 'lwc';
import Grandparent from 'x/grandparent';

describe('vdom removes component while it is already disconnected', () => {
    it('repro "must have been connected" error W-14037619', async () => {
        const elm = createElement('x-grandparent', { is: Grandparent });
        document.body.appendChild(elm);

        await Promise.resolve();
        elm.showChild = true;
        await Promise.resolve();
        elm.showChild = false;

        document.body.removeChild(elm);

        await Promise.resolve();
        elm.showChild = true;
        await Promise.resolve();
        elm.showChild = false;
        await Promise.resolve();
    });
});
