export default function tmpl($api, $cmp, $slotset, $ctx) {
    const _expr = $cmp.isTrue || undefined;

    return [$api.h(
        "section",
        {},
        [_expr ? $api.d($cmp.foo) : null, _expr ? $api.d($cmp.bar) : null]
    )];
}
tmpl.ids = ["isTrue", "foo", "bar"];
