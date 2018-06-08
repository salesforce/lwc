export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element, s: api_slot } = $api;

    return [
        api_slot(
            'secret-slot',
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
            ],
            $slotset
        )
    ];
}
tmpl.slots = ['secret-slot'];
