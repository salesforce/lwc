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
            }
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
                },
                props: {
                    href: '/foo',
                    title: 'test',
                    tabIndex: 'test'
                }
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
            },
            props: {
                fooBar: 'x',
                foo: 'bar',
                bgcolor: 'blue',
                tabIndex: 'bar'
            }
        }),
        api_element(
            'svg',
            {
                classMap: {
                    cubano: true
                },
                attrs: {
                    focusable: 'true'
                }
            },
            [
                api_element(
                    'use',
                    {
                        attrs: {
                            'xlink:href': 'xx'
                        }
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
            }
        }),
        api_element(
            'table',
            {
                attrs: {
                    bgcolor: 'x'
                }
            },
            []
        ),
        api_custom_element('table', _nsTable, {
            attrs: {
                bgcolor: 'x',
                is: 'ns-table'
            },
            props: {
                bar: 'test',
                min: '3',
                tabIndex: '2'
            }
        }),
        api_element(
            'div',
            {
                className: $cmp.foo,
                attrs: {
                    'aria-hidden': 'hidden'
                }
            },
            []
        )
    ];
}
