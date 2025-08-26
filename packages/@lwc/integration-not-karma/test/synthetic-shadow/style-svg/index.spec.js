import { createElement } from 'lwc';

import StaticSvg from 'x/staticSvg';
import StaticSvgInDiv from 'x/staticSvgInDiv';
import StaticSvgInDivScoped from 'x/staticSvgInDivScoped';
import StaticSvgScoped from 'x/staticSvgScoped';
import StaticText from 'x/staticText';
import StaticTextScoped from 'x/staticTextScoped';

describe('styling svg', () => {
    const scenarios = [
        {
            name: 'static svg',
            Ctor: StaticSvg,
            tag: 'x-static-svg',
        },
        {
            name: 'static svg in div',
            Ctor: StaticSvgInDiv,
            tag: 'x-static-svg-in-div',
        },
        {
            name: 'static text',
            Ctor: StaticText,
            tag: 'x-static-text',
        },
        {
            name: 'static svg - scoped css',
            Ctor: StaticSvgScoped,
            tag: 'x-static-svg',
        },
        {
            name: 'static svg in div - scoped css',
            Ctor: StaticSvgInDivScoped,
            tag: 'x-static-svg-in-div',
        },
        {
            name: 'static text - scoped css',
            Ctor: StaticTextScoped,
            tag: 'x-static-text',
        },
    ];

    for (const { name, Ctor, tag } of scenarios) {
        it(name, async () => {
            const elm = createElement(tag, { is: Ctor });
            document.body.appendChild(elm);
            await new Promise((resolve) => requestAnimationFrame(() => resolve()));
            expect(getComputedStyle(elm.shadowRoot.querySelector('svg')).fill).toEqual(
                'rgb(255, 0, 0)'
            );
            expect(getComputedStyle(elm.shadowRoot.querySelector('text')).display).toEqual('none');
        });
    }
});
