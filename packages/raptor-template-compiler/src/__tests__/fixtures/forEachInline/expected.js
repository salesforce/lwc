export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element, i: api_iterator } = $api;

    return [
        api_element(
            'section',
            {},
            api_iterator($cmp.items, function(item) {
                return api_element(
                    'div',
                    {
                        classMap: {
                            'my-list': true
                        }
                    },
                    [api_element('p', {}, [api_text('items')])]
                );
            })
        )
    ];
}
