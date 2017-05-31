export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {
            className: $cmp.foo.c
        },
        [$api.h(
            "p",
            {
                className: $cmp.bar.c
            },
            []
        )]
    )];
}
