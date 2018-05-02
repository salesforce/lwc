export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element } = $api;

    return [
        api_element(
            'section',
            {
                key: 9
            },
            [
                api_element(
                    'p',
                    {
                        key: 1
                    },
                    [api_text('Before header')]
                ),
                api_element(
                    'slot',
                    {
                        attrs: {
                            name: 'header'
                        },
                        key: 2
                    },
                    [api_text('Default header')]
                ),
                api_element(
                    'p',
                    {
                        key: 3
                    },
                    [api_text('In')]
                ),
                api_element(
                    'p',
                    {
                        key: 4
                    },
                    [api_text('between')]
                ),
                api_element(
                    'slot',
                    {
                        key: 6
                    },
                    [
                        api_element(
                            'p',
                            {
                                key: 5
                            },
                            [api_text('Default body')]
                        )
                    ]
                ),
                api_element(
                    'slot',
                    {
                        attrs: {
                            name: 'footer'
                        },
                        key: 8
                    },
                    [
                        api_element(
                            'p',
                            {
                                key: 7
                            },
                            [api_text('Default footer')]
                        )
                    ]
                )
            ]
        )
    ];
}
tmpl.slots = ["header", "", "footer"];
