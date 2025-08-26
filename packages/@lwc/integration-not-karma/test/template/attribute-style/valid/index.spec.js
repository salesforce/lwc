import { createElement } from 'lwc';

import Static from 'x/static';
import Dynamic from 'x/dynamic';

describe('static style attribute', () => {
    it('renders the style attribute', () => {
        const elm = createElement('x-static', { is: Static });
        document.body.appendChild(elm);

        const target = elm.shadowRoot.querySelector('div');

        expect(target.style.position).toBe('absolute');
        expect(target.style.top).toBe('10px');
        expect(target.style.getPropertyValue('--custom-property').trim()).toBe('blue');
    });
});

describe('dynamic style attribute', () => {
    function testRenderStyleAttribute(type, value, expectedValue) {
        it(`renders the style attribute for ${type}`, () => {
            const elm = createElement('x-dynamic', { is: Dynamic });
            elm.dynamicStyle = value;
            document.body.appendChild(elm);

            expect(elm.shadowRoot.querySelector('div').getAttribute('style')).toBe(expectedValue);
        });
    }

    testRenderStyleAttribute('null', null, null);
    testRenderStyleAttribute('undefined', undefined, null);
    testRenderStyleAttribute('empty string', '', null);
    testRenderStyleAttribute('css style string', 'position: relative;', 'position: relative;');
    testRenderStyleAttribute(
        'css custom property',
        '--custom-property:blue;',
        '--custom-property:blue;'
    );

    function testUpdateStyleAttribute(type, value, expectedValue) {
        it(`updates the style attribute for ${type}`, () => {
            const elm = createElement('x-dynamic', { is: Dynamic });
            elm.dynamicStyle = 'position: relative;';
            document.body.appendChild(elm);

            expect(elm.shadowRoot.querySelector('div').getAttribute('style')).toBe(
                'position: relative;'
            );

            elm.dynamicStyle = value;
            return Promise.resolve().then(() => {
                expect(elm.shadowRoot.querySelector('div').getAttribute('style')).toBe(
                    expectedValue
                );
            });
        });
    }

    testUpdateStyleAttribute('null', null, null);
    testUpdateStyleAttribute('undefined', undefined, null);
    testUpdateStyleAttribute('empty string', '', null);
    testUpdateStyleAttribute('css style string', 'position: absolute;', 'position: absolute;');
    testUpdateStyleAttribute(
        'css custom property',
        '--custom-property:blue;',
        '--custom-property:blue;'
    );
});
