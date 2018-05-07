import _nsCmp from 'ns-cmp';
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element, c: api_custom_element } = $api;

    return [
        api_element(
            'section',
            {
                key: 4
            },
            [
                api_custom_element(
                    'ns-cmp',
                    _nsCmp,
                    {
                        key: 3
                    },
                    [
                        $cmp.isTrue
                            ? api_element(
                                'p',
                                {
                                    attrs: {
                                        slot: true
                                    },
                                    key: 1
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
                                key: 2
                            },
                            [api_text('S2')]
                        )
                    ]
                )
            ]
        )
    ];
}
