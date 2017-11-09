import _xB from 'x-b';
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const {
        h: api_element,
        t: api_text,
        i: api_iterator,
        f: api_flatten,
        c: api_custom_element
    } = $api;

    return [
        api_element('div', {}, [
            api_custom_element('x-b', _xB, {
                slotset: {
                    $default$: api_flatten([
                        $cmp.isLoading ? api_element('div', {}, []) : null,
                        $cmp.haveLoadedItems
                            ? api_iterator($cmp.menuItems, function(item) {
                                  return api_text('x');
                              })
                            : []
                    ])
                }
            })
        ])
    ];
}
