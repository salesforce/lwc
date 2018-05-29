export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element, s: api_slot } = $api;

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
                api_slot(
                    '',
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
                    ],
                    $slotset
                )
            ]
        )
    ];
}
tmpl.slots = [''];
