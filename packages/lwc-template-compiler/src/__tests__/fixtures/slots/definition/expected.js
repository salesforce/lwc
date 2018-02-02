export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element } = $api;
    const { $default$: slot0 } = $slotset;

    return [
        api_element(
            'section',
            {
                key: 3
            },
            slot0 || [api_element(
                'p',
                {
                    key: 1
                },
                [
                    api_text('Default slot content')
                ]
            )]
        )
    ];
}
tmpl.slots = ['$default$'];
