export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { h: api_element } = $api;

    return [
        api_element(
            'section',
            {
                style: $cmp.customStyle
            },
            []
        )
    ];
}
