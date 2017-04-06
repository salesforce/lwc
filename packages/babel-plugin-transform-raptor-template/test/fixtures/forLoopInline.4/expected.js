export default function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
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
