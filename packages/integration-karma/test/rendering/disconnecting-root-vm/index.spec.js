import { createElement } from 'lwc';
import ParentCmp from 'x/parent';

describe('disconnecting root vm', () => {
    it('should not throw an error when disconnecting an already disconnected child vm', function (done) {
        const elm = createElement('x-parent', { is: ParentCmp });
        elm.labels = ['label 1', 'label 2'];
        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            elm.labels = [];
            document.body.removeChild(elm);

            setTimeout(() => {
                expect(elm.getError()).toBe(null);
                done();
            });
        });
    });
});
