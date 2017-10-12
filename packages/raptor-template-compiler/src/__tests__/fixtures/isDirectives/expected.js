import _nsRow from 'ns-row';
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { c: api_custom_element, i: api_iterator, h: api_element } = $api;

    return [
        api_element('table', {}, [
            api_element(
                'tbody',
                {},
                api_iterator($cmp.rows, function(row) {
                    return row.visible
                        ? api_custom_element('tr', _nsRow, {
                              attrs: {
                                  is: 'ns-row'
                              }
                          })
                        : null;
                })
            )
        ])
    ];
}
