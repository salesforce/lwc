export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element, d: api_dynamic } = $api;

    return [
        api_element('section', {}, [
            $cmp.isTrue ? api_element('p', {}, [api_text('1')]) : null,
            api_dynamic($cmp.foo),
            $cmp.isTrue ? api_element('p', {}, [api_text('3')]) : null
        ])
    ];
}
