import _nsItem from 'ns-item';
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const {
        k: api_key,
        d: api_dynamic,
        c: api_custom_element,
        i: api_iterator,
        h: api_element
    } = $api;

    return [
        api_element(
            'ul',
            {
                key: 2
            },
            api_iterator($cmp.items, function(item) {
                return api_custom_element('ns-item', _nsItem, {
                    key: api_key(1, item.key),
                    slotset: {
                        $default$: [api_dynamic(item.value)]
                    }
                });
            })
        )
    ];
}
