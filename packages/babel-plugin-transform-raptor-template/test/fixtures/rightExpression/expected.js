export default function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
    return [$api.h(
        "section",
        {},
        [$api.h(
            "p",
            {
                className: $cmp.bar
            },
            []
        )]
    )];
}
tmpl.ids = ["bar"];
