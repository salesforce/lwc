export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element } = $api;

    return [
        api_element('section', {
            key: 2
        },
        [
            api_element(
                'p',
                {
                    attrs: {
                        title: 'x',
                        'aria-hidden': 'x',
                    },
                    key: 1,
                },
                [api_text('x')]
            )
        ])
    ];
}
