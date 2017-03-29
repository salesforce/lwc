export default function tmpl($api, $cmp, $slotset, $ctx) {
    const _expr = $cmp.isTrue || $api.e();

    const m = $ctx.memoized || ($ctx.memoized = {});
    return [$api.h(
        "section",
        {},
        [_expr && $api.s($cmp.foo), _expr && $api.s($cmp.bar)]
    )];
}
tmpl.ids = ["isTrue", "foo", "bar"];
