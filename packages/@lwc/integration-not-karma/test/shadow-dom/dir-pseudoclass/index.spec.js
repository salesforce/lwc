import { createElement } from 'lwc';

import Component from 'c/component';
import ShadowContainer from 'c/shadowContainer';
import Light from 'c/light';

function supportsDirPseudoclass() {
    const div = document.createElement('div');
    div.innerHTML = `
          <style>.test-dir-pseudo:dir(rtl){ color: red }</style>
          <div dir="rtl" class="test-dir-pseudo"></div>
        `;

    document.body.appendChild(div);

    const supports =
        getComputedStyle(div.querySelector('.test-dir-pseudo')).color === 'rgb(255, 0, 0)';
    document.body.removeChild(div);
    return supports;
}

// In native shadow we delegate to the browser, so it has to support :dir()
describe.runIf(!process.env.NATIVE_SHADOW || supportsDirPseudoclass())(':dir() pseudoclass', () => {
    it('can apply styles based on :dir()', async () => {
        const elm = createElement('c-parent', { is: Component });
        document.body.appendChild(elm);

        elm.setAttribute('dir', 'ltr');

        await Promise.resolve();
        expect(getComputedStyle(elm.shadowRoot.querySelector('div')).color).toEqual('rgb(0, 0, 1)');
        expect(getComputedStyle(elm.shadowRoot.querySelector('.foo')).color).toEqual(
            'rgb(0, 0, 3)'
        );
        expect(getComputedStyle(elm.shadowRoot.querySelector('.foo.bar')).color).toEqual(
            'rgb(0, 0, 5)'
        );
        expect(getComputedStyle(elm.shadowRoot.querySelector('.baz span')).color).toEqual(
            'rgb(0, 0, 7)'
        );
        expect(getComputedStyle(elm.shadowRoot.querySelector('.baz button')).color).toEqual(
            'rgb(0, 0, 9)'
        );
        elm.setAttribute('dir', 'rtl');
        expect(getComputedStyle(elm.shadowRoot.querySelector('div')).color).toEqual('rgb(0, 0, 2)');
        expect(getComputedStyle(elm.shadowRoot.querySelector('.foo')).color).toEqual(
            'rgb(0, 0, 4)'
        );
        expect(getComputedStyle(elm.shadowRoot.querySelector('.foo.bar')).color).toEqual(
            'rgb(0, 0, 6)'
        );
        expect(getComputedStyle(elm.shadowRoot.querySelector('.baz span')).color).toEqual(
            'rgb(0, 0, 8)'
        );
        expect(getComputedStyle(elm.shadowRoot.querySelector('.baz button')).color).toEqual(
            'rgb(0, 0, 10)'
        );
    });

    it('can apply styles based on :dir() for light-within-shadow', async () => {
        const elm = createElement('c-shadow-container', { is: ShadowContainer });
        document.body.appendChild(elm);

        elm.setAttribute('dir', 'ltr');

        await Promise.resolve();
        expect(getComputedStyle(elm.shadowRoot.querySelector('div')).color).toEqual('rgb(0, 0, 1)');
        elm.setAttribute('dir', 'rtl');
        expect(getComputedStyle(elm.shadowRoot.querySelector('div')).color).toEqual('rgb(0, 0, 2)');
    });
});

it.runIf(process.env.NATIVE_SHADOW && supportsDirPseudoclass())(
    'can apply styles based on :dir() for light-at-root',
    async () => {
        const elm = createElement('c-light', { is: Light });
        document.body.appendChild(elm);

        await Promise.resolve();
        // Unlike [dir], :dir(ltr) matches even when there is no dir attribute anywhere
        expect(getComputedStyle(elm.querySelector('div')).color).toEqual('rgb(0, 0, 1)');
        elm.setAttribute('dir', 'rtl');
        expect(getComputedStyle(elm.querySelector('div')).color).toEqual('rgb(0, 0, 2)');
        elm.setAttribute('dir', 'ltr');
        expect(getComputedStyle(elm.querySelector('div')).color).toEqual('rgb(0, 0, 1)');
    }
);
