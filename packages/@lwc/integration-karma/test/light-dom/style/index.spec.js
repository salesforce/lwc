import { createElement } from 'lwc';

import Container from 'x/container';
import Two from 'x/two';
import Shadow from 'x/shadow';

describe('Light DOM styling', () => {
    it('styles bleed into other light DOM but not shadow DOM components', () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        expect(elm.shadowRoot).not.toBeNull();

        const getColor = (elm) => getComputedStyle(elm).color;

        expect(getColor(elm.shadowRoot.querySelector('x-one .my-fancy-class'))).toEqual(
            'rgb(255, 0, 0)'
        );
        expect(getColor(elm.shadowRoot.querySelector('x-two .my-fancy-class'))).toEqual(
            'rgb(255, 0, 0)'
        );
        // synthetic shadow can't do this kind of style encapsulation
        if (process.env.NATIVE_SHADOW) {
            expect(
                getColor(
                    elm.shadowRoot
                        .querySelector('x-shadow')
                        .shadowRoot.querySelector('.my-fancy-class')
                )
            ).toEqual('rgb(0, 0, 0)');
        }

        // synthetic shadow can't do this kind of style encapsulation
        if (process.env.NATIVE_SHADOW) {
            // sibling elements should be unaffected
            const two = createElement('x-two', { is: Two });
            const shadow = createElement('x-shadow', { is: Shadow });

            document.body.appendChild(two);
            document.body.appendChild(shadow);

            expect(getColor(two.querySelector('.my-fancy-class'))).toEqual('rgb(0, 0, 0)');
            expect(getColor(shadow.shadowRoot.querySelector('.my-fancy-class'))).toEqual(
                'rgb(0, 0, 0)'
            );
        }
    });
});
