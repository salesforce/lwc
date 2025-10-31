import { createElement } from 'lwc';

import Container from 'c/container';
import Two from 'c/two';
import Shadow from 'c/shadow';

describe('Light DOM styling', () => {
    it('styles bleed into other light DOM but not shadow DOM components', () => {
        const elm = createElement('c-container', { is: Container });
        document.body.appendChild(elm);

        expect(elm.shadowRoot).not.toBeNull();

        const getColor = (elm) => getComputedStyle(elm).color;

        expect(getColor(elm.shadowRoot.querySelector('c-one .my-fancy-class'))).toEqual(
            'rgb(255, 0, 0)'
        );
        expect(getColor(elm.shadowRoot.querySelector('c-two .my-fancy-class'))).toEqual(
            'rgb(255, 0, 0)'
        );
        // synthetic shadow can't do this kind of style encapsulation
        if (process.env.NATIVE_SHADOW) {
            expect(
                getColor(
                    elm.shadowRoot
                        .querySelector('c-shadow')
                        .shadowRoot.querySelector('.my-fancy-class')
                )
            ).toEqual('rgb(0, 0, 0)');
        }

        // synthetic shadow can't do this kind of style encapsulation
        if (process.env.NATIVE_SHADOW) {
            // sibling elements should be unaffected
            const two = createElement('c-two', { is: Two });
            const shadow = createElement('c-shadow', { is: Shadow });

            document.body.appendChild(two);
            document.body.appendChild(shadow);

            expect(getColor(two.querySelector('.my-fancy-class'))).toEqual('rgb(0, 0, 0)');
            expect(getColor(shadow.shadowRoot.querySelector('.my-fancy-class'))).toEqual(
                'rgb(0, 0, 0)'
            );
        }
    });
});
