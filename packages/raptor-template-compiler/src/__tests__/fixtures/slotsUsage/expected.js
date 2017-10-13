import _nsCmp from 'ns-cmp';
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element, c: api_custom_element } = $api;

    return [
        api_element('section', {}, [
            api_custom_element('ns-cmp', _nsCmp, {
                slotset: {
                    header: [
                        api_element(
                            'p',
                            {
                                attrs: {
                                    slot: 'header',
                                },
                            },
                            [api_text('Header Slot Content')],
                        ),
                    ],
                    $default$: [
                        api_element(
                            'p',
                            {
                                attrs: {
                                    slot: true,
                                },
                            },
                            [api_text('Default Content')],
                        ),
                    ],
                },
            }),
        ]),
    ];
}
