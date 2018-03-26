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
                        'aria-hidden': 'x'
                    },
                    props: {
                        title: 'x',
                    },
                    key: 1
                },
                [api_text('x')]
            )
        ])
    ];
}
