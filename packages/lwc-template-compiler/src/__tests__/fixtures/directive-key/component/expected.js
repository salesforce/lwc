import _nsItem from 'ns-item';
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const {
        d: api_dynamic,
        c: api_custom_element,
        i: api_iterator,
        h: api_element
    } = $api;

    return [
        api_element(
            'ul',
            {
                ck: 2
            },
            api_iterator($cmp.items, function(item) {
                return api_custom_element('ns-item', _nsItem, {
                    key: item.key,
                    ck: 1,
                    slotset: {
                        $default$: [api_dynamic(item.value)]
                    }
                });
            })
        )
    ];
}
