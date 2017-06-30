export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {},
        $api.f([$api.h(
            "p",
            {},
            [$api.t("Before header")]
        ), $slotset.header || [$api.t("Default header")], $api.h(
            "p",
            {},
            [$api.t("In")]
        ), $api.h(
            "p",
            {},
            [$api.t("between")]
        ), $slotset.$default$ || [$api.h(
            "p",
            {},
            [$api.t("Default body")]
        )], $slotset.footer || [$api.h(
            "p",
            {},
            [$api.t("Default footer")]
        )]])
    )];
}
tmpl.slots = ["header", "$default$", "footer"];
