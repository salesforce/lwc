export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { h: api_element } = $api;

    return [
        api_element('section', {
            ck: 2,
        },
        [
            api_element(
                'p',
                {
                    className: $cmp.bar,
                    ck: 1
                },
                []
            )
        ])
    ];
}
