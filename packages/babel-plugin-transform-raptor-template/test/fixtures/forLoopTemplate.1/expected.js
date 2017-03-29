export default function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
    return [$api.h(
        "section",
        {},
        $api.i($cmp.items, function (item, index) {
            return [$api.h(
                "p",
                {},
                ["1", $api.s(item)]
            ), $api.h(
                "p",
                {},
                ["2", $api.s(item.foo)]
            ), $api.h(
                "p",
                {},
                ["3", $api.s($cmp.other)]
            ), $api.h(
                "p",
                {},
                ["4", $api.s($cmp.other.foo)]
            )];
        })
    )];
}
tmpl.ids = ["items", "other"];
