import { createElement } from 'lwc';

import Container from 'x/container';

describe('Light DOM styling - multiple light DOM components', () => {
    it('styles bleed mutually across light DOM components', () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        expect(elm.shadowRoot).not.toBeNull();

        const getStyle = (elm) => {
            const { color, backgroundColor, opacity } = getComputedStyle(elm);
            return { color, backgroundColor, opacity };
        };

        expect(getStyle(elm.shadowRoot.querySelector('x-one .my-awesome-class'))).toEqual({
            color: 'rgb(255, 255, 0)',
            backgroundColor: 'rgb(0, 0, 0)',
            opacity: '0.75',
        });
        expect(getStyle(elm.shadowRoot.querySelector('x-two .my-awesome-class'))).toEqual({
            color: 'rgb(255, 255, 0)',
            backgroundColor: 'rgb(0, 0, 0)',
            opacity: '0.75',
        });
    });
});
