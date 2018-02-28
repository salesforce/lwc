import _nsFoo from 'ns-foo';
import _nsBar from 'ns-bar';
import _nsBuzz from 'ns-buzz';
import _nsTable from 'ns-table';
import _nsInput from "ns-input";
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { c: api_custom_element, h: api_element } = $api;

    return [
        api_custom_element('ns-foo', _nsFoo, {
            props: {
                d: $cmp.p.foo
            },
            key: 1
        }),
        api_element(
            'a',
            {
                classMap: {
                    test: true
                },
                attrs: {
                    'data-foo': 'datafoo',
                    'aria-hidden': 'h',
                    role: 'presentation',
                    href: '/foo',
                    title: 'test',
                    tabindex: 'test'
                },
                key: 2
            },
            []
        ),
        api_custom_element('ns-bar', _nsBar, {
            classMap: {
                r: true
            },
            attrs: {
                'data-xx': 'foo',
            },
            props: {
                ariaHidden: 'hidden',
                fooBar: 'x',
                foo: 'bar',
                role: 'xx',
                tabIndex: 'bar',
                bgColor: 'blue',
            },
            key: 3
        }),
        api_element(
            'svg',
            {
                classMap: {
                    cubano: true
                },
                attrs: {
                    focusable: 'true'
                },
                key: 5
            },
            [
                api_element(
                    'use',
                    {
                        attrs: {
                            'xlink:href': 'xx'
                        },
                        key: 4
                    },
                    []
                )
            ]
        ),
        api_custom_element('div', _nsBuzz, {
            attrs: {
                is: 'ns-buzz'
            },
            props: {
                bgColor: 'x',
                ariaHidden: 'hidden'
            },
            key: 6
        }),
        api_element(
            'table',
            {
                attrs: {
                    bgcolor: 'x'
                },
                key: 7
            },
            []
        ),
        api_custom_element('table', _nsTable, {
            attrs: {
                is: 'ns-table',
            },
            props: {
                bgColor: 'x',
                tabIndex: '2',
                bar: 'test',
                min: '3'
            },
            key: 8
        }),
        api_custom_element("input", _nsInput, {
            attrs: {
                is: "ns-input"
            },
            props: {
                maxLength: "10"
            },
            key: 9
        }),
        api_element(
            'div',
            {
                className: $cmp.foo,
                attrs: {
                    'aria-hidden': 'hidden'
                },
                key: 10
            },
            []
        )
    ];
}
