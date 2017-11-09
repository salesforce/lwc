export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { h: api_element } = $api;

    return [
        api_element(
            'section',
            {
                classMap: {
                    foo: true,
                    bar: true,
                    'baz-fiz': true
                }
            },
            []
        )
    ];
}
