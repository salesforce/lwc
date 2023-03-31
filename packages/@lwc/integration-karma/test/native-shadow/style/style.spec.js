import { createElement } from 'lwc';
import FirstShadow from 'x/firstShadow';
import SecondShadow from 'x/secondShadow';

describe('style', () => {
    it('styles do not leak out of shadow elements', () => {
        const style = document.createElement('style');
        style.textContent = 'div { color: blue }';
        const div = document.createElement('div');
        div.textContent = 'hello';
        const firstShadow = createElement('x-first-shadow', { is: FirstShadow });
        const secondShadow = createElement('x-second-shadow', { is: SecondShadow });
        document.body.appendChild(style);
        document.body.appendChild(div);
        document.body.appendChild(firstShadow);
        document.body.appendChild(secondShadow);

        expect(getComputedStyle(div).color).toEqual('rgb(0, 0, 255)'); // blue
        expect(getComputedStyle(firstShadow.shadowRoot.querySelector('div')).color).toEqual(
            'rgb(255, 0, 0)'
        ); // red
        expect(getComputedStyle(secondShadow.shadowRoot.querySelector('div')).color).toEqual(
            'rgb(255, 255, 0)'
        ); // yellow
    });
});
