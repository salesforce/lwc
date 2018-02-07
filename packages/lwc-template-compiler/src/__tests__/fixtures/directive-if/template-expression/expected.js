export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { d: api_dynamic, t: api_text, h: api_element } = $api;

    return [
        api_element(
            'section',
            {
                key: 1
            },
            [
                $cmp.state.isTrue ? api_dynamic($cmp.foo) : null,
                $cmp.state.isTrue ? api_text(' ') : null,
                $cmp.state.isTrue ? api_dynamic($cmp.bar) : null
            ]
        )
    ];
}
