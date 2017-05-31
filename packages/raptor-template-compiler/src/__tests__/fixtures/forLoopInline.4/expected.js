export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "ul",
        {},
        $api.f([$api.i($cmp.items, function (item, index) {
            return $api.h(
                "li",
                {
                    className: item.x
                },
                [$api.d(item)]
            );
        }), $api.h(
            "li",
            {},
            [$api.t("Last")]
        )])
    )];
}
