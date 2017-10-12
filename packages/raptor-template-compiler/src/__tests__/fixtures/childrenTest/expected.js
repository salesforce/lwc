export default function tmpl($api, $cmp, $slotset, $ctx) {
    const {
        t: api_text,
        i: api_iterator,
        h: api_element,
        f: api_flatten
    } = $api;

    return [
        api_element(
            'section',
            {
                classMap: {
                    s1: true
                }
            },
            api_flatten([
                api_text('Other Child'),
                api_iterator($cmp.items, function(item) {
                    return api_text('X');
                }),
                api_element('p', {}, [api_text('Last child')])
            ])
        ),
        api_element(
            'section',
            {
                classMap: {
                    s2: true
                }
            },
            api_flatten([
                api_text('Other Child'),
                $cmp.isTrue
                    ? api_iterator($cmp.items, function(item) {
                          return [
                              api_element('p', {}, [api_text('X1')]),
                              api_element('p', {}, [api_text('X2')])
                          ];
                      })
                    : []
            ])
        ),
        api_element(
            'section',
            {
                classMap: {
                    s3: true
                }
            },
            api_flatten([
                api_element('p', {}, [api_text('Last child')]),
                api_iterator($cmp.items, function(item) {
                    return api_element('div', {}, []);
                })
            ])
        ),
        api_element(
            'section',
            {
                classMap: {
                    s4: true
                }
            },
            [
                api_element('p', {}, [api_text('Other child1')]),
                api_element('p', {}, [api_text('Other child2')])
            ]
        )
    ];
}
