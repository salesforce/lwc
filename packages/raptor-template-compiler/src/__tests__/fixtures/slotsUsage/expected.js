import _nsCmp from 'ns-cmp';
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element, c: api_custom_element } = $api;

    return [
        api_element('section', {}, [
            api_custom_element('ns-cmp', _nsCmp, {
                slotset: {
                    $default$: [api_element('p', {}, [api_text('S3')])]
                }
            })
        ])
    ];
}
