export default function tmpl($api, $cmp, $slotset, $ctx) {
    const {
        t: api_text,
        i: api_iterator,
        h: api_element,
        f: api_flatten
    } = $api;

    return [
        api_element(
            'section',
            {
                classMap: {
                    s1: true
                },
                ck: 2,
            },
            api_flatten([
                api_text('Other Child'),
                api_iterator($cmp.items, function(item) {
                    return api_text('X');
                }),
                api_element(
                    'p',
                    {
                        ck: 1
                    },
                    [
                        api_text('Last child')
                    ]
                )
            ])
        ),
        api_element(
            'section',
            {
                classMap: {
                    s2: true
                },
                ck: 5
            },
            api_flatten([
                api_text('Other Child'),
                $cmp.isTrue
                    ? api_iterator($cmp.items, function(item) {
                          return [
                              api_element(
                                'p',
                                {
                                    ck: 3
                                },
                                [
                                    api_text('X1')
                                ]
                            ),
                            api_element(
                                'p',
                                {
                                    ck: 4
                                },
                                [
                                    api_text('X2')
                                ]
                            )
                          ];
                      })
                    : []
            ])
        ),
        api_element(
            'section',
            {
                classMap: {
                    s3: true
                },
                ck: 8
            },
            api_flatten([
                api_element(
                    'p',
                    {
                        ck: 6
                    },
                    [
                        api_text('Last child')
                    ]
                ),
                api_iterator($cmp.items, function(item) {
                    return api_element(
                        'div',
                        {
                            ck: 7
                        },
                        []
                    );
                })
            ])
        ),
        api_element(
            'section',
            {
                classMap: {
                    s4: true
                },
                ck: 11
            },
            [
                api_element(
                    'p',
                    {
                        ck: 9
                    },
                    [
                        api_text('Other child1')
                    ]
                ),
                api_element(
                    'p',
                    {
                        ck: 10
                    },
                    [
                        api_text('Other child2')
                    ]
                )
            ]
        )
    ];
}
