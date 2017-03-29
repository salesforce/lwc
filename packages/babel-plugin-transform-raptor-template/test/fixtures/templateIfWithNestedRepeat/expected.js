export default function tmpl($api, $cmp, $slotset, $ctx) {
    const _expr = $cmp.isTrue || $api.e();

    const m = $ctx.memoized || ($ctx.memoized = {});
    return [_expr && $api.f(
        ["Outer", $api.i($cmp.items, function (item) {
            return $api.h(
                "p",
                {},
                ["Inner"]
            );
        })]
    )];
}
tmpl.ids = ["isTrue", "items"];
