export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {},
        $api.f([$api.i($cmp.items, function (item, index) {
            return [$api.h(
                "p",
                {},
                ["1", item]
            ), $api.h(
                "p",
                {},
                ["2", item]
            )];
        }), $api.h(
            "p",
            {},
            ["3", $cmp.item]
        )])
    )];
}
tmpl.ids = ["items", "item"];
