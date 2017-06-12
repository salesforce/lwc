export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "ul",
        {},
        $api.i($cmp.items, function (item, index) {
            return $api.h(
                "li",
                {},
                [$api.d(index), $api.t(" - "), $api.d(item)]
            );
        })
    )];
}
