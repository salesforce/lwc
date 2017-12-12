export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element } = $api;

    return [
        api_element('section', {}, [
            $cmp.isTrue ? api_element('p', {}, [api_text('1')]) : null,
            $cmp.isTrue ? api_element('p', {}, [api_text('2')]) : null,
            $cmp.isTrue ? api_element('p', {}, [api_text('3')]) : null
        ])
    ];
}
