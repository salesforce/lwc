import _nsFoo from 'ns-foo';
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { b: api_bind, c: api_custom_element, h: api_element } = $api;

    const { _m0 } = $ctx;
    return [
        api_element('section', {}, [
            api_custom_element('ns-foo', _nsFoo, {
                on: {
                    foo: _m0 || ($ctx._m0 = api_bind($cmp.handleFoo))
                }
            })
        ])
    ];
}
