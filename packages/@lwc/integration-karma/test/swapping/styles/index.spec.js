import { createElement, swapStyle } from 'lwc';
import Simple from 'base/simple';

const { blockStyle, inlineStyle, noneStyle } = Simple;

// Swapping is only enabled in dev mode
if (process.env.NODE_ENV !== 'production') {
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
    });
}
