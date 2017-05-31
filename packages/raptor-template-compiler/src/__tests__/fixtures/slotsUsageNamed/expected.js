export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {},
        $slotset.test || [$api.h(
            "p",
            {},
            [$api.t("Test slot content")]
        )]
    )];
}
