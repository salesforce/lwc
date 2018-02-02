export default function tmpl($api, $cmp, $slotset, $ctx) {
    const {
        t: api_text,
        d: api_dynamic,
        h: api_element,
        i: api_iterator
    } = $api;

    return [
        api_element(
            'section',
            {
                key: 5
            },
            api_iterator($cmp.items, function(item) {
                return [
                    api_element(
                        'p',
                        {
                            key: 1
                        },
                        [
                            api_text('1'),
                            api_dynamic(item)
                        ]
                    ),
                    api_element(
                        'p',
                        {
                            key: 2
                        },
                        [
                            api_text('2'),
                            api_dynamic(item.foo)
                        ]
                    ),
                    api_element(
                        'p',
                        {
                            key: 3
                        },
                        [
                            api_text('3'),
                            api_dynamic($cmp.other)
                        ]
                    ),
                    api_element(
                        'p',
                        {
                            key: 4
                        },
                        [
                            api_text('4'),
                            api_dynamic($cmp.other.foo)
                        ]
                    )
                ];
            })
        )
    ];
}
