export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { d: api_dynamic, h: api_element } = $api;

    return [api_element('p', {}, [api_dynamic($cmp.text)])];
}
