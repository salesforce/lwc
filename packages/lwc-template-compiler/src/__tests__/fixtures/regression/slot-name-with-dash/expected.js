export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element } = $api;

    return [
        api_element(
            'slot',
            {
                attrs: {
                    name: 'secret-slot'
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
    ];
}
tmpl.slots = ['secret-slot'];
