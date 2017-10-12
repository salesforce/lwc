export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { d: api_dynamic } = $api;

    return [api_dynamic($cmp.text)];
}
