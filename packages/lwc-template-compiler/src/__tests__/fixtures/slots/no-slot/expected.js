import _xCmp from 'x-cmp';
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { c: api_custom_element } = $api;

    return [api_custom_element('x-cmp', _xCmp, {})];
}
