export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element, f: api_flatten } = $api;
    const { header: slot0, $default$: slot1, footer: slot2 } = $slotset;

    return [
        api_element(
            'section',
            {},
            api_flatten([
                api_element('p', {}, [api_text('Before header')]),
                slot0 || [api_text('Default header')],
                api_element('p', {}, [api_text('In')]),
                api_element('p', {}, [api_text('between')]),
                slot1 || [api_element('p', {}, [api_text('Default body')])],
                slot2 || [api_element('p', {}, [api_text('Default footer')])]
            ])
        )
    ];
}
tmpl.slots = ['header', '$default$', 'footer'];
