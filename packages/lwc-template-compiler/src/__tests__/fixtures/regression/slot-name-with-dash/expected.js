export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element } = $api;
    const { 'secret-slot': slot0 } = $slotset;

    return slot0 || [
        api_element(
            'p',
            {
                ck: 1
            },
            [
                api_text('Test slot content')
            ]
        )
    ];
}
tmpl.slots = ['secret-slot'];
