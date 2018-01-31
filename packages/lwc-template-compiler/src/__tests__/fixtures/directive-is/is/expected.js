import _nsRow from 'ns-row';
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { c: api_custom_element, h: api_element } = $api;

    return [
        api_element(
            'table',
            {
                ck: 3
            },
            [
                api_element(
                    'tbody',
                    {
                        ck: 2
                    },
                    [
                        api_custom_element('tr', _nsRow, {
                            attrs: {
                                is: 'ns-row'
                            },
                            ck: 1
                        })
                    ]
                )
            ]
        )
    ];
}
