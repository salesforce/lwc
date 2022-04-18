import { createElement, swapStyle } from 'lwc';
import Simple from 'base/simple';

const { blockStyle, inlineStyle, noneStyle } = Simple;

describe('style swapping', () => {
    it('should work with components with implicit style definition', () => {
        const elm = createElement('x-simple', { is: Simple });
        document.body.appendChild(elm);
        expect(getComputedStyle(elm.shadowRoot.querySelector('.simple')).display).toBe(
            'block',
            'the default display should be block'
        );
        swapStyle(blockStyle[0], inlineStyle[0]);
        return Promise.resolve()
            .then(() => {
                expect(getComputedStyle(elm.shadowRoot.querySelector('.simple')).display).toBe(
                    'inline'
                );
                swapStyle(inlineStyle[0], noneStyle[0]);
            })
            .then(() => {
                expect(getComputedStyle(elm.shadowRoot.querySelector('.simple')).display).toBe(
                    'none'
                );
            });
    });

    afterEach(() => {
        // FIXME: Currently, hot swapping does not actually remove styles from the DOM
        for (const elm of document.head.querySelectorAll('style')) {
            elm.parentElement.removeChild(elm);
        }
        if (document.adoptedStyleSheets) {
            document.adoptedStyleSheets = [];
        }
    });
});
