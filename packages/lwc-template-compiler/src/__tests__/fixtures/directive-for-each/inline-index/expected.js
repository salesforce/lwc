export default function tmpl($api, $cmp, $slotset, $ctx) {
    const {
        d: api_dynamic,
        t: api_text,
        h: api_element,
        i: api_iterator
    } = $api;

    return [
        api_element(
            'ul',
            {
                key: 2
            },
            api_iterator($cmp.items, function(item, index) {
                return api_element(
                    'li',
                    {
                        key: 1
                    },
                    [
                        api_dynamic(index),
                        api_text(' - '),
                        api_dynamic(item)
                    ]
                );
            })
        )
    ];
}
