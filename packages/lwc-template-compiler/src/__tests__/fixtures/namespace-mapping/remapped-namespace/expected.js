import _nsFoo from 'ns/foo';
import _xFoo from 'x/foo';
import _nsBar from 'ns/bar';
import _nestedCFoo from 'nested/cFoo';
import _nsBaz from 'ns/baz';
import _xBaz from 'x/baz';
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { c: api_custom_element, h: api_element } = $api;

    return [
        api_custom_element(
            'ns-foo',
            _nsFoo,
            {
                key: 1,
            },
            [],
        ),
        api_custom_element(
            'x-foo',
            _xFoo,
            {
                key: 2,
            },
            [],
        ),
        api_element(
            'div',
            {
                key: 4,
            },
            [
                api_custom_element(
                    'ns-bar',
                    _nsBar,
                    {
                        key: 3,
                    },
                    [],
                ),
            ],
        ),
        api_custom_element(
            'nested-c-foo',
            _nestedCFoo,
            {
                key: 5,
            },
            [],
        ),
        api_custom_element(
            'ns-baz',
            _nsBaz,
            {
                key: 6,
            },
            [],
        ),
        api_custom_element(
            'x-baz',
            _xBaz,
            {
                key: 7,
            },
            [],
        ),
    ];
}
