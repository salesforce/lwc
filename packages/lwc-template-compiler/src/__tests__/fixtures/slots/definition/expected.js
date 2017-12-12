export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element } = $api;
    const { $default$: slot0 } = $slotset;

    return [
        api_element(
            'section',
            {},
            slot0 || [api_element('p', {}, [api_text('Default slot content')])]
        )
    ];
}
tmpl.slots = ['$default$'];
