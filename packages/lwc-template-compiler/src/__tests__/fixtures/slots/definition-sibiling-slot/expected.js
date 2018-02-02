export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element, f: api_flatten } = $api;
    const { other: slot0, $default$: slot1 } = $slotset;

    return [
        api_element(
            'section',
            {
                key: 5
            },
            api_flatten([
                slot0 || [
                    api_element(
                        'p',
                        {
                            key: 1
                        },
                        [
                            api_text('Default slot other content')
                        ]
                    )
                ],
                slot1 || [
                    api_element(
                        'p',
                        {
                            key: 3
                        },
                        [
                            api_text('Default slot content')
                        ]
                    )
                ]
            ])
        )
    ];
}
tmpl.slots = ['other', '$default$'];
