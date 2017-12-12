export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element } = $api;

    return [
        api_element('section', {}, [
            api_element(
                'p',
                {
                    attrs: {
                        title: 'x',
                        'aria-hidden': 'x'
                    }
                },
                [api_text('x')]
            )
        ])
    ];
}
