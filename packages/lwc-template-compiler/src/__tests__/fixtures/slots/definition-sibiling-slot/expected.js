export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element } = $api;

    return [
        api_element(
            'section',
            {
                key: 5
            },
            [
                api_element(
                    'slot',
                    {
                        attrs: {
                            name: 'other'
                        },
                        key: 2
                    },
                    [
                        api_element(
                            'p',
                            {
                                key: 1
                            },
                            [api_text('Default slot other content')]
                        )
                    ]
                ),
                api_element(
                    'slot',
                    {
                        key: 4
                    },
                    [
                        api_element(
                            'p',
                            {
                                key: 3
                            },
                            [api_text('Default slot content')]
                        )
                    ]
                )
            ]
        )
    ];
}
tmpl.slots = ['other', ''];
