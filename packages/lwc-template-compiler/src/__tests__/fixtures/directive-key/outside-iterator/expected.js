export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { h: api_element } = $api;

    return [
        api_element(
            'div',
            {
                key: $cmp.keyGetter
            },
            []
        )
    ];
}
