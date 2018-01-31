import _nsRow from 'ns-row';
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { c: api_custom_element, i: api_iterator, h: api_element } = $api;

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
                    api_iterator($cmp.rows, function(row) {
                        return row.visible
                            ? api_custom_element('tr', _nsRow, {
                                attrs: {
                                    is: 'ns-row'
                                },
                                ck: 1
                            })
                            : null;
                    })
                )
            ]
        )
    ];
}
