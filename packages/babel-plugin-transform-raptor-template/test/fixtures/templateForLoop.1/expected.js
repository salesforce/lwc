const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        null,
        $api.f([$api.f($api.i($cmp.items, function (item, index) {
            return [$api.h(
                "p",
                null,
                ["1", $api.s(item)]
            ), $api.h(
                "p",
                null,
                ["2", $api.s(item.foo)]
            ), $api.h(
                "p",
                null,
                ["3", $api.s($cmp.other)]
            ), $api.h(
                "p",
                null,
                ["4", $api.s($cmp.other.foo)]
            )];
        }))])
    )];
}
export const templateUsedIds = ["items", "other"];
