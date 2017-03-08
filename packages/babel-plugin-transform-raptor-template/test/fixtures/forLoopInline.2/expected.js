const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        {},
        $api.i($cmp.items, function (item, index) {
            return $api.h(
                "div",
                {
                    class: "my-list"
                },
                [$api.h(
                    "p",
                    {},
                    [$api.s(item)]
                ), $api.h(
                    "p",
                    {},
                    [$api.s($cmp.item2)]
                )]
            );
        })
    )];
}
export const templateUsedIds = ["items", "item2"];
