export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element, i: api_iterator } = $api;

    return [
        api_element(
            'section',
            {
                ck: 3
            },
            api_iterator($cmp.items, function(item) {
                return api_element(
                    'div',
                    {
                        classMap: {
                            'my-list': true
                        },
                        ck: 2
                    },
                    [
                        api_element(
                            'p',
                            {
                                ck: 1
                            },
                            [
                                api_text('items')
                            ]
                        )
                    ]
                );
            })
        )
    ];
}
