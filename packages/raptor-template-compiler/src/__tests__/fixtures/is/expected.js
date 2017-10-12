import _nsRow from 'ns-row';
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { c: api_custom_element, h: api_element } = $api;

    return [
        api_element('table', {}, [
            api_element('tbody', {}, [
                api_custom_element('tr', _nsRow, {
                    attrs: {
                        is: 'ns-row'
                    }
                })
            ])
        ])
    ];
}
