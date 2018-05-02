export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element } = $api;

    return [
        api_element(
            'section',
            {
                key: 3
            },
            [
                api_element(
                    'slot',
                    {
                        attrs: {
                            name: 'test'
                        },
                        key: 2
                    },
                    [
                        api_element(
                            'p',
                            {
                                key: 1
                            },
                            [api_text('Test slot content')]
                        )
                    ]
                )
            ]
        )
    ];
}
tmpl.slots = ["test"];
