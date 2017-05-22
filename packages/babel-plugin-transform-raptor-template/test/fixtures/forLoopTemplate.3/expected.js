export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {},
        $api.f([$api.i($cmp.items, function (item, index) {
            return [$api.h(
                "p",
                {},
                [$api.t("1"), item]
            ), $api.h(
                "p",
                {},
                [$api.t("2"), item]
            )];
        }), $api.h(
            "p",
            {},
            [$api.t("3"), $api.d($cmp.item)]
        )])
    )];
}
tmpl.ids = ["items", "item"];
