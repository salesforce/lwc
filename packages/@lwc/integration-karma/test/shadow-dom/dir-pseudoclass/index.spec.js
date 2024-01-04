import { createElement } from 'lwc';

import Component from 'x/component';
import ShadowContainer from 'x/shadowContainer';
import Light from 'x/light';

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
if (!process.env.NATIVE_SHADOW || supportsDirPseudoclass()) {
    describe(':dir() pseudoclass', () => {
        it('can apply styles based on :dir()', () => {
            const elm = createElement('x-parent', { is: Component });
            document.body.appendChild(elm);

            elm.setAttribute('dir', 'ltr');

            return Promise.resolve()
                .then(() => {
                    expect(getComputedStyle(elm.shadowRoot.querySelector('div')).color).toEqual(
                        'rgb(0, 0, 1)'
                    );
                    expect(getComputedStyle(elm.shadowRoot.querySelector('.foo')).color).toEqual(
                        'rgb(0, 0, 3)'
                    );
                    expect(
                        getComputedStyle(elm.shadowRoot.querySelector('.foo.bar')).color
                    ).toEqual('rgb(0, 0, 5)');
                    expect(
                        getComputedStyle(elm.shadowRoot.querySelector('.baz span')).color
                    ).toEqual('rgb(0, 0, 7)');
                    expect(
                        getComputedStyle(elm.shadowRoot.querySelector('.baz button')).color
                    ).toEqual('rgb(0, 0, 9)');
                    elm.setAttribute('dir', 'rtl');
                })
                .then(() => {
                    expect(getComputedStyle(elm.shadowRoot.querySelector('div')).color).toEqual(
                        'rgb(0, 0, 2)'
                    );
                    expect(getComputedStyle(elm.shadowRoot.querySelector('.foo')).color).toEqual(
                        'rgb(0, 0, 4)'
                    );
                    expect(
                        getComputedStyle(elm.shadowRoot.querySelector('.foo.bar')).color
                    ).toEqual('rgb(0, 0, 6)');
                    expect(
                        getComputedStyle(elm.shadowRoot.querySelector('.baz span')).color
                    ).toEqual('rgb(0, 0, 8)');
                    expect(
                        getComputedStyle(elm.shadowRoot.querySelector('.baz button')).color
                    ).toEqual('rgb(0, 0, 10)');
                });
        });

        it('can apply styles based on :dir() for light-within-shadow', () => {
            const elm = createElement('x-shadow-container', { is: ShadowContainer });
            document.body.appendChild(elm);

            elm.setAttribute('dir', 'ltr');

            return Promise.resolve()
                .then(() => {
                    expect(getComputedStyle(elm.shadowRoot.querySelector('div')).color).toEqual(
                        'rgb(0, 0, 1)'
                    );
                    elm.setAttribute('dir', 'rtl');
                })
                .then(() => {
                    expect(getComputedStyle(elm.shadowRoot.querySelector('div')).color).toEqual(
                        'rgb(0, 0, 2)'
                    );
                });
        });
    });
}

if (process.env.NATIVE_SHADOW && supportsDirPseudoclass()) {
    it('can apply styles based on :dir() for light-at-root', () => {
        const elm = createElement('x-light', { is: Light });
        document.body.appendChild(elm);

        return Promise.resolve()
            .then(() => {
                // Unlike [dir], :dir(ltr) matches even when there is no dir attribute anywhere
                expect(getComputedStyle(elm.querySelector('div')).color).toEqual('rgb(0, 0, 1)');
                elm.setAttribute('dir', 'rtl');
            })
            .then(() => {
                expect(getComputedStyle(elm.querySelector('div')).color).toEqual('rgb(0, 0, 2)');
                elm.setAttribute('dir', 'ltr');
            })
            .then(() => {
                expect(getComputedStyle(elm.querySelector('div')).color).toEqual('rgb(0, 0, 1)');
            });
    });
}
