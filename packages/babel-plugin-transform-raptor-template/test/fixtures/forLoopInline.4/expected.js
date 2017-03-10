const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "ul",
        {},
        $api.f([$api.i($cmp.items, function (item, index) {
            return $api.h(
                "li",
                {
                    className: item.x
                },
                [$api.s(item)]
            );
        }), $api.h(
            "li",
            {},
            ["Last"]
        )])
    )];
}
export const templateUsedIds = ["items"];
