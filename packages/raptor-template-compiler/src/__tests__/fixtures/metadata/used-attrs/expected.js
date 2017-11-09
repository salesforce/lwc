export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { d: api_dynamic, h: api_element } = $api;

    return [
        api_element('section', {}, [
            api_element('p', {}, [api_dynamic($cmp.obj.sub)])
        ])
    ];
}
