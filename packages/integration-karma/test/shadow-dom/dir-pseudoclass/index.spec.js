import { createElement } from 'lwc';

import Component from 'x/component';

describe(':dir() pseudoclass', () => {
    // See https://stackoverflow.com/a/61597966
    function supportsSelector(selector) {
        const style = document.createElement('style');
        document.head.appendChild(style);
        try {
            style.sheet.insertRule(selector + '{}', 0);
        } catch (e) {
            return false;
        } finally {
            document.head.removeChild(style);
        }
        return true;
    }

    if (!process.env.NATIVE_SHADOW || supportsSelector(':dir(ltr)')) {
        // In native shadow we delegate to the browser, so it has to support :dir()

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
    }
});
