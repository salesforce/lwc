export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { h: api_element } = $api;

    return [
        api_element(
            'section',
            {
                className: $cmp.foo.c
            },
            [
                api_element(
                    'p',
                    {
                        className: $cmp.bar.c
                    },
                    []
                )
            ]
        )
    ];
}
