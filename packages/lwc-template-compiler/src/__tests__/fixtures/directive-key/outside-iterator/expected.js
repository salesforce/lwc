export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { k: api_key, h: api_element } = $api;

    return [
        api_element(
            'div',
            {
                key: api_key(1, $cmp.keyGetter)
            },
            []
        )
    ];
}
