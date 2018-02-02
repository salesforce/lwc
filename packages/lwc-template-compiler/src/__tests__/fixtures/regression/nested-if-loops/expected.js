export default function tmpl($api, $cmp, $slotset, $ctx) {
    const {
        t: api_text,
        h: api_element,
        i: api_iterator,
        f: api_flatten
    } = $api;

    return $cmp.isTrue
        ? api_flatten([
              api_text('Outer'),
              api_iterator($cmp.items, function(item) {
                  return api_element(
                        'p',
                        {
                            key: 1
                        },
                        [
                          api_text('Inner')
                        ]
                    );
                })
          ])
        : [];
}
