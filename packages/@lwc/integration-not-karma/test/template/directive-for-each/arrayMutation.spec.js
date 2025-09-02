import { createElement } from 'lwc';
import XArrayMutation from 'x/arrayMutation';

describe('Testing array primitives', () => {
    let elm;
    beforeEach(() => {
        elm = createElement('x-array-mutation', { is: XArrayMutation });
        document.body.appendChild(elm);
    });

    it('check initial state', function () {
        const actual = elm.shadowRoot.querySelectorAll('li').length;
        expect(actual).toBe(5);
    });

    function testReactivity(testCase, expectedItems, fn) {
        it(`check ${testCase} reactivity`, function () {
            fn(elm);
            return Promise.resolve().then(function () {
                var list = Array.prototype.slice.call(elm.shadowRoot.querySelectorAll('li'));

                var textList = list.map(function (li) {
                    return li.textContent;
                });
                expect(textList).toEqual(expectedItems);
            });
        });
    }

    testReactivity('slice', ['one', 'three', 'four', 'five'], (elm) => {
        elm.spliceItems();
    });
    testReactivity('unshift', ['unshifted', 'one', 'two', 'three', 'four', 'five'], (elm) => {
        elm.unshiftItem();
    });
    testReactivity('push', ['one', 'two', 'three', 'four', 'five', 'pushed'], (elm) => {
        elm.pushItem();
    });
    testReactivity(
        'concat native to proxy',
        ['one', 'two', 'three', 'four', 'five', 'concat 1', 'concat 2'],
        (elm) => {
            elm.concatNativeToProxy();
        }
    );
    testReactivity(
        'concat proxy to native',
        ['concat 1', 'concat 2', 'one', 'two', 'three', 'four', 'five'],
        (elm) => {
            elm.concatProxyToNative();
        }
    );
});
