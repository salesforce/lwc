export default function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
    return [$api.h(
        "section",
        {},
        [$cmp.isTrue ? $api.h(
            "p",
            {},
            ["1"]
        ) : $api.e(), $cmp.isTrue ? $api.h(
            "p",
            {},
            ["2"]
        ) : $api.e(), $cmp.isTrue ? $api.h(
            "p",
            {},
            ["3"]
        ) : $api.e()]
    )];
}
tmpl.ids = ["isTrue"];
