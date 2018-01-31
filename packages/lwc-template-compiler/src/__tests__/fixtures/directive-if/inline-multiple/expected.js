export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element } = $api;

    return [
        api_element(
            'section',
            {
                ck: 4
            },
            [
                $cmp.isTrue ? api_element(
                    'p',
                    {
                        ck: 1
                    },
                    [
                        api_text('1')
                    ]
                ) : null,
                $cmp.isTrue ? api_element(
                    'p',
                    {
                        ck: 2
                    },
                    [
                        api_text('2')
                    ]
                ) : null,
                $cmp.isTrue ? api_element(
                    'p',
                    {
                        ck: 3
                    },
                    [
                        api_text('3')
                    ]
                ) : null
            ]
        )
    ];
}
