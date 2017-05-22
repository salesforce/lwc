export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {},
        $api.f([$api.h(
            "p",
            {},
            [$api.t("Sibling")]
        ), $slotset.$default$ || [$api.h(
            "p",
            {},
            [$api.t("Default slot content")]
        )]])
    )];
}
tmpl.slots = ["$default$"];
