import { createElement } from 'lwc';
import Component from 'x/component';

describe('host pseudo', () => {
    // TODO [#3225]: we should  not support selector lists in :host()
    it(`supports :host() pseudo class`, async () => {
        const elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);
        const div = elm.querySelector('.quux');

        // expected styles for the div based on classes added to the light "host"
        const expectedStyles = [
            ['', ['rgb(0, 0, 0)', '0px']],
            ['foo', ['rgb(0, 128, 0)', '17px']],
            ['bar', ['rgb(0, 128, 0)', '17px']],
            ['foo bar', ['rgb(0, 128, 0)', '17px']],
        ];

        for (const [className, [color, marginLeft]] of expectedStyles) {
            const oldClassName = elm.className;
            elm.className += ' ' + className;
            await new Promise((resolve) => requestAnimationFrame(resolve));
            expect(getComputedStyle(div).color).toEqual(color);
            expect(getComputedStyle(div).marginLeft).toEqual(marginLeft);
            elm.className = oldClassName; // reset so we keep the scope token
        }
    });
});
