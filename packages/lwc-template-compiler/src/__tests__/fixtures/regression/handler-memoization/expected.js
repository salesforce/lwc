export default function tmpl($api, $cmp, $slotset, $ctx) {
    const {
        t: api_text,
        b: api_bind,
        h: api_element,
        d: api_dynamic,
        i: api_iterator
    } = $api;

    const { _m0 } = $ctx;
    return [
        api_element(
            'button',
            {
                on: {
                    click: _m0 || ($ctx._m0 = api_bind($cmp.create))
                }
            },
            [api_text('New')]
        ),
        api_element(
            'ul',
            {},
            api_iterator($cmp.list, function(task) {
                return api_element('li', {}, [
                    api_dynamic(task.title),
                    api_element(
                        'button',
                        {
                            on: {
                                click: api_bind(task.delete)
                            }
                        },
                        [api_text('[X]')]
                    )
                ]);
            })
        )
    ];
}
