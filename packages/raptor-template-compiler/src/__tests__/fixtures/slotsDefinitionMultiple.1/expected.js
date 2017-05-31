export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {},
        $api.f([$slotset.other || [$api.h(
            "p",
            {},
            [$api.t("Default slot other content")]
        )], $slotset.$default$ || [$api.h(
            "p",
            {},
            [$api.t("Default slot content")]
        )]])
    )];
}
