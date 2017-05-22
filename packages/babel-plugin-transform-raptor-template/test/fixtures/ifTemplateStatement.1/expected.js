export default function tmpl($api, $cmp, $slotset, $ctx) {
    const _expr = $cmp.bar || undefined;

    return [$api.h(
        "section",
        {},
        [$api.h(
            "p",
            {},
            [$api.t("1")]
        ), _expr && $api.h(
            "p",
            {},
            [$api.t("2")]
        ), $api.h(
            "p",
            {},
            [$api.t("3")]
        )]
    )];
}
tmpl.ids = ["bar"];
