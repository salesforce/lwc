export default function tmpl($api, $cmp, $slotset, $ctx) {
    const _expr = $cmp.isTrue || undefined,
          _expr2 = !$cmp.isTrue2 || undefined;

    const m = $ctx.memoized || ($ctx.memoized = {});
    return [_expr && $api.h(
        "p",
        {},
        ["1"]
    ), _expr2 && $api.h(
        "p",
        {},
        ["2"]
    )];
}
tmpl.ids = ["isTrue", "isTrue2"];
