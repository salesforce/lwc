import { createElement } from 'lwc';

import StaticSvg from 'c/staticSvg';
import StaticSvgInDiv from 'c/staticSvgInDiv';
import StaticSvgInDivScoped from 'c/staticSvgInDivScoped';
import StaticSvgScoped from 'c/staticSvgScoped';
import StaticText from 'c/staticText';
import StaticTextScoped from 'c/staticTextScoped';

describe('styling svg', () => {
    const scenarios = [
        {
            name: 'static svg',
            Ctor: StaticSvg,
            tag: 'c-static-svg',
        },
        {
            name: 'static svg in div',
            Ctor: StaticSvgInDiv,
            tag: 'c-static-svg-in-div',
        },
        {
            name: 'static text',
            Ctor: StaticText,
            tag: 'c-static-text',
        },
        {
            name: 'static svg - scoped css',
            Ctor: StaticSvgScoped,
            tag: 'c-static-svg',
        },
        {
            name: 'static svg in div - scoped css',
            Ctor: StaticSvgInDivScoped,
            tag: 'c-static-svg-in-div',
        },
        {
            name: 'static text - scoped css',
            Ctor: StaticTextScoped,
            tag: 'c-static-text',
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
