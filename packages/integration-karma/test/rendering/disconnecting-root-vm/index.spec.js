import { createElement } from 'lwc';
import ParentCmp from 'x/parent';

const defer = () => new Promise(setTimeout);

describe('disconnecting root vm', () => {
    it('should not throw an error when disconnecting an already disconnected child vm', async function () {
        const elm = createElement('x-parent', { is: ParentCmp });
        elm.labels = ['label 1', 'label 2'];
        document.body.appendChild(elm);

        await defer();
        elm.labels = [];
        document.body.removeChild(elm);

        await defer();
        expect(elm.getError()).toBe(null);
    });
});
