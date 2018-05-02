export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element } = $api;

    return [
        api_element(
            'section',
            {
                key: 4
            },
            [
                api_element(
                    'p',
                    {
                        key: 1
                    },
                    [api_text('Sibling')]
                ),
                api_element(
                    'slot',
                    {
                        key: 3
                    },
                    [
                        api_element(
                            'p',
                            {
                                key: 2
                            },
                            [api_text('Default slot content')]
                        )
                    ]
                )
            ]
        )
    ];
}
tmpl.slots = [''];
