export default function tmpl($api, $cmp, $slotset, $ctx) {
    const {
        t: api_text,
        d: api_dynamic,
        h: api_element,
        i: api_iterator
    } = $api;

    return [
        api_element(
            'section',
            {
                ck: 3
            },
            api_iterator($cmp.items, function(xValue, xIndex, xFirst, xLast) {
                return api_element(
                    'div',
                    {
                        attrs: {
                            'data-islast': xLast,
                            'data-isfirst': xFirst
                        },
                        ck: 2
                    },
                    [
                        api_element(
                            'span',
                            {
                                ck: 1
                            }, [
                                api_text('Row: '),
                                api_dynamic(xIndex)
                            ]
                        ),
                        api_text('. Value: '),
                        api_dynamic(xValue)
                    ]
                );
            })
        )
    ];
}
