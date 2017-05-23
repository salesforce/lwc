export default function tmpl($api, $cmp, $slotset, $ctx) {
    const _expr = $cmp.isTrue || undefined,
          _expr2 = $cmp.isTrue || undefined,
          _expr3 = $cmp.isTrue || undefined;

    return [_expr ? $api.h(
        "p",
        {},
        [$api.t("1")]
    ) : null, _expr2 ? $api.h(
        "p",
        {},
        [$api.t("2")]
    ) : null, _expr3 ? $api.h(
        "p",
        {},
        [$api.t("3")]
    ) : null];
}
tmpl.ids = ["isTrue"];
