export default function tmpl($api, $cmp, $slotset, $ctx) {
    const _expr = $cmp.isTrue || undefined;

    return [$api.h(
        "section",
        {},
        [_expr && $api.d($cmp.foo), _expr && $api.d($cmp.bar)]
    )];
}
tmpl.ids = ["isTrue", "foo", "bar"];
