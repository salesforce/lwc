export default function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
    return [$api.h(
        "section",
        {},
        $api.f([$api.i($cmp.items, function (item, index) {
            return [$api.h(
                "p",
                {},
                ["1", $api.s(item)]
            ), $api.h(
                "p",
                {},
                ["2", $api.s(item)]
            )];
        }), $api.h(
            "p",
            {},
            ["3", $api.s($cmp.item)]
        )])
    )];
}
tmpl.ids = ["items", "item"];
