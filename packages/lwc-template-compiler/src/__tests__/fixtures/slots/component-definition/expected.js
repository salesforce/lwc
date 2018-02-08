import _xFoo from 'x-foo';
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { c: api_custom_element } = $api;
    const { $default$: slot0 } = $slotset;

    return [
        api_custom_element('x-foo', _xFoo, {
            key: 1,
            slotset: {
                $default$: slot0 || []
            }
        })
    ];
}
tmpl.slots = ['$default$'];
