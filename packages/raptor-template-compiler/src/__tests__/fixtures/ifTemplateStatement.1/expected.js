export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element } = $api;

    return [
        api_element('section', {}, [
            api_element('p', {}, [api_text('1')]),
            $cmp.bar ? api_element('p', {}, [api_text('2')]) : null,
            api_element('p', {}, [api_text('3')])
        ])
    ];
}
