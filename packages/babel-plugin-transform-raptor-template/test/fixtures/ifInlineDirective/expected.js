export default function tmpl($api, $cmp, $slotset, $ctx) {
    const _expr = $cmp.isTrue || undefined,
          _expr2 = !$cmp.isTrue2 || undefined;

    return [_expr && $api.h(
        "p",
        {},
        [$api.t("1")]
    ), _expr2 && $api.h(
        "p",
        {},
        [$api.t("2")]
    )];
}
tmpl.ids = ["isTrue", "isTrue2"];
