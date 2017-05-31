export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {},
        [$api.h(
            "p",
            {},
            [$api.t("1")]
        ), $cmp.bar ? $api.h(
            "p",
            {},
            [$api.t("2")]
        ) : null, $api.h(
            "p",
            {},
            [$api.t("3")]
        )]
    )];
}
