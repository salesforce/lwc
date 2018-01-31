export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { h: api_element } = $api;

    return [
        api_element('section', {
            ck: 2
        },
        [
            api_element(
                'p',
                {
                    attrs: {
                        'data--bar-baz': 'xyz'
                    },
                    ck: 1
                },
                []
            )
        ])
    ];
}
