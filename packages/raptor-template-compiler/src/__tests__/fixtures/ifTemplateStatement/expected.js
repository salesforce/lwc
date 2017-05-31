export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {},
        [
            $cmp.isTrue ? $api.d($cmp.foo) : null,
            $cmp.isTrue ? $api.t(" ") : null,
            $cmp.isTrue ? $api.d($cmp.bar) : null
        ]
    )];
}
