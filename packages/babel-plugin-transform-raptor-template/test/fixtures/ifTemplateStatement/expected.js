export default function tmpl($api, $cmp, $slotset, $ctx) {
    const _expr = $cmp.isTrue || undefined;

    return [$api.h(
        "section",
        {},
        [_expr && $cmp.foo, _expr && $cmp.bar]
    )];
}
tmpl.ids = ["isTrue", "foo", "bar"];
