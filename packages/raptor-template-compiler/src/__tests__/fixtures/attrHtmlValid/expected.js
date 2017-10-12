export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element } = $api;

    return [
        api_element('section', {}, [
            api_element(
                'textarea',
                {
                    attrs: {
                        minlength: '1',
                        maxlength: '5'
                    }
                },
                [api_text('x')]
            )
        ])
    ];
}
