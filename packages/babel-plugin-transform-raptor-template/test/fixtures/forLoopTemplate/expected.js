const memoized = Symbol('memoize');
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        {},
        $api.i($cmp.items, function (item, index) {
            return $api.h(
                "p",
                {},
                ["1", $api.s(item)]
            );
        })
    )];
}
export const templateUsedIds = ["items"];
