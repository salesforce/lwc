import { createElement } from 'lwc';
import Grandparent from 'x/grandparent';
import { extractDataIds } from '../../../helpers/utils.js';

describe.runIf(process.env.NATIVE_SHADOW)('part and exportparts', () => {
    it('supports part and exportparts', () => {
        const elm = createElement('x-grandparent', { is: Grandparent });
        document.body.appendChild(elm);

        const ids = extractDataIds(elm);

        return Promise.resolve().then(() => {
            expect(getComputedStyle(ids.overlay).color).toEqual('rgb(255, 0, 0)');
            expect(getComputedStyle(ids.text).color).toEqual('rgb(0, 0, 255)');
            expect(getComputedStyle(ids.badge).color).toEqual('rgb(0, 128, 0)');
        });
    });
});
