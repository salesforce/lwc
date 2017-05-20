export default function tmpl($api, $cmp, $slotset, $ctx) {
    const _expr = $cmp.isTrue || undefined,
          _expr2 = $cmp.isTrue || undefined,
          _expr3 = $cmp.isTrue || undefined;

    return [_expr && $api.h(
        "p",
        {},
        ["1"]
    ), _expr2 && $api.h(
        "p",
        {},
        ["2"]
    ), _expr3 && $api.h(
        "p",
        {},
        ["3"]
    )];
}
tmpl.ids = ["isTrue"];
