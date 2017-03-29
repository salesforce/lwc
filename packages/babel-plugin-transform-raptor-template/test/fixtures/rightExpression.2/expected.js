export default function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
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
tmpl.ids = ["foo", "bar"];
