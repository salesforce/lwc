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
                [item]
            );
        }), $api.h(
            "li",
            {},
            ["Last"]
        )])
    )];
}
tmpl.ids = ["items"];
