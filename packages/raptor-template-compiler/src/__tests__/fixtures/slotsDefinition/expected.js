export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {},
        $slotset.$default$ || [$api.h(
            "p",
            {},
            [$api.t("Default slot content")]
        )]
    )];
}
tmpl.slots = ["$default$"];
