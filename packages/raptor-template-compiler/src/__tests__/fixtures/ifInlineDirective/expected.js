export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$cmp.isTrue ? $api.h(
        "p",
        {},
        [$api.t("1")]
    ) : null, !$cmp.isTrue2 ? $api.h(
        "p",
        {},
        [$api.t("2")]
    ) : null];
}
