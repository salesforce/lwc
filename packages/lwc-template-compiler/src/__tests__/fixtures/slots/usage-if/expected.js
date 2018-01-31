import _nsCmp from 'ns-cmp';
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element, c: api_custom_element } = $api;

    return [
        api_element(
            'section',
            {
                ck: 2
            },
            [
                api_custom_element('ns-cmp', _nsCmp, {
                    ck: 1,
                    slotset: {
                        $default$: [
                            $cmp.isTrue
                                ? api_element(
                                    'p',
                                    {
                                        attrs: {
                                            slot: true
                                        },
                                        ck: 1
                                    },
                                    [api_text('S1')]
                                )
                                : null,
                            api_element(
                                'p',
                                {
                                    attrs: {
                                        slot: true
                                    },
                                    ck: 2
                                },
                                [api_text('S2')]
                            )
                        ]
                    }
                })
            ]
        )
    ];
}
