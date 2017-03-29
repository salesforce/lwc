export default function tmpl($api, $cmp, $slotset, $ctx) {
    const _expr = $cmp.isTrue || $api.e(),
          _expr2 = $cmp.isTrue || $api.e(),
          _expr3 = $cmp.isTrue || $api.e();

    const m = $ctx.memoized || ($ctx.memoized = {});
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
