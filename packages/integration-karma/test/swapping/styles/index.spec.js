import { createElement } from 'lwc';

// TODO [#1869]: getting the global API from global LWC in tests until it is allowed in compiler
const { swapStyle } = LWC;

import Simple from 'base/simple';
const { blockStyle, inlineStyle, noneStyle } = Simple;

describe('style swapping', () => {
    it('should work with components with implicit style definition', () => {
        const elm = createElement('x-simple', { is: Simple });
        document.body.appendChild(elm);
        expect(getComputedStyle(elm.shadowRoot.firstChild).display).toBe('block');
        swapStyle(blockStyle[0], inlineStyle[0]);
        return Promise.resolve()
            .then(() => {
                expect(getComputedStyle(elm.shadowRoot.firstChild).display).toBe('inline');
                swapStyle(inlineStyle[0], noneStyle[0]);
            })
            .then(() => {
                expect(getComputedStyle(elm.shadowRoot.firstChild).display).toBe('none');
            });
    });
});
