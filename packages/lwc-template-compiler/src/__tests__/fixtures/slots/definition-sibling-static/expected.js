export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element, f: api_flatten } = $api;
    const { $default$: slot0 } = $slotset;

    return [
        api_element(
            'section',
            {
                key: 4
            },
            api_flatten([
                api_element(
                    'p',
                    {
                        key: 1
                    },
                    [
                        api_text('Sibling')
                    ]
                ),
                slot0 || [
                    api_element(
                        'p',
                        {
                            key: 2
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
tmpl.slots = ['$default$'];
