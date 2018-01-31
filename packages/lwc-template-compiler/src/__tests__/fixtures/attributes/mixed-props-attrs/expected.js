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
            ck: 1
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
                ck: 2
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
            ck: 3
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
                ck: 5
            },
            [
                api_element(
                    'use',
                    {
                        attrs: {
                            'xlink:href': 'xx'
                        },
                        ck: 4
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
            ck: 6
        }),
        api_element(
            'table',
            {
                attrs: {
                    bgcolor: 'x'
                },
                ck: 7
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
            ck: 8
        }),
        api_element(
            'div',
            {
                className: $cmp.foo,
                attrs: {
                    'aria-hidden': 'hidden'
                },
                ck: 9
            },
            []
        )
    ];
}
