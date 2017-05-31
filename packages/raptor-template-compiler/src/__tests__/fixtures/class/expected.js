export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {
            classMap: {
                foo: true,
                bar: true,
                "baz-fiz": true
            }
        },
        []
    )];
}
