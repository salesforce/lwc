export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { d: api_dynamic, h: api_element, i: api_iterator } = $api;

    return [
        api_element(
            'ul',
            {},
            api_iterator($cmp.items, function(item) {
                return api_element(
                    'li',
                    {
                        className: item.x
                    },
                    [api_dynamic(item)]
                );
            })
        )
    ];
}
