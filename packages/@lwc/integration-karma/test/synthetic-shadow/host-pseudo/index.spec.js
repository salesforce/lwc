import { createElement } from 'lwc';
import Valid from 'x/valid';
import Invalid from 'x/invalid';

describe('host pseudo', () => {
    function testComponent(Component, name) {
        it(`supports :host() pseudo class - ${name}`, async () => {
            const elm = createElement('x-component', { is: Component });
            document.body.appendChild(elm);
            const div = elm.shadowRoot.querySelector('.quux');

            // expected styles for the div based on classes added to the shadow host
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
    }

    // TODO [#3225]: we should  not support selector lists in :host()
    if (!process.env.NATIVE_SHADOW) {
        testComponent(Invalid, 'invalid syntax');
    }

    // Here we are using the correct syntax here for :host(), so it should work in both native and synthetic shadow
    // See: https://github.com/salesforce/lwc/issues/3225
    testComponent(Valid, 'valid syntax');
});
