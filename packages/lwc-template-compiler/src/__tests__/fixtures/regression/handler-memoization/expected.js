export default function tmpl($api, $cmp, $slotset, $ctx) {
    const {
        t: api_text,
        b: api_bind,
        h: api_element,
        d: api_dynamic,
        k: api_key,
        i: api_iterator
    } = $api;

    const { _m0 } = $ctx;
    return [
        api_element(
            'button',
            {
                key: 1,
                on: {
                    click: _m0 || ($ctx._m0 = api_bind($cmp.create))
                }
            },
            [api_text('New')]
        ),
        api_element(
            'ul',
            {
                key: 4
            },
            api_iterator($cmp.list, function(task) {
                return api_element(
                    'li',
                    {
                        key: api_key(3, task)
                    },
                    [
                        api_dynamic(task.title),
                        api_element(
                            'button',
                            {
                                key: 2,
                                on: {
                                    click: api_bind(task.delete)
                                }
                            },
                            [api_text('[X]')]
                        )
                    ]
                );
            })
        )
    ];
}
