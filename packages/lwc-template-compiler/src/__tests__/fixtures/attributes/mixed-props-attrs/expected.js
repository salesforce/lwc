import _nsFoo from 'ns-foo';
import _nsBar from 'ns-bar';
import _nsBuzz from 'ns-buzz';
import _nsTable from 'ns-table';
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
                'aria-hidden': 'hidden',
                role: 'xx',
                tabindex: 'bar'
            },
            props: {
                fooBar: 'x',
                foo: 'bar',
                bgcolor: 'blue'
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
                is: 'ns-buzz',
                'aria-hidden': 'hidden'
            },
            props: {
                bgcolor: 'x'
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
                bgcolor: 'x',
                is: 'ns-table',
                tabindex: '2'
            },
            props: {
                bar: 'test',
                min: '3'
            },
            key: 8
        }),
        api_element(
            'div',
            {
                className: $cmp.foo,
                attrs: {
                    'aria-hidden': 'hidden'
                },
                key: 9
            },
            []
        )
    ];
}
