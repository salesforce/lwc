export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {},
        [
            $cmp.state.isTrue ? $api.d($cmp.foo) : null,
            $cmp.state.isTrue ? $api.t(" ") : null,
            $cmp.state.isTrue ? $api.d($cmp.bar) : null
        ]
    )];
}
