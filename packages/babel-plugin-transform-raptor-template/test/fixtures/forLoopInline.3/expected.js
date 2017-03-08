const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "ul",
        {},
        $api.i($cmp.items, function (item, index) {
            return $api.h(
                "li",
                {
                    class: item.x
                },
                [$api.s(item)]
            );
        })
    )];
}
export const templateUsedIds = ["items"];
