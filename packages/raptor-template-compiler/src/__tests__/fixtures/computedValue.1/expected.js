export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "p",
        {},
        [$api.d($cmp.text)]
    )];
}
