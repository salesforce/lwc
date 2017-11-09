export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element } = $api;

    return [api_element('p', {}, [api_text('Root')])];
}
