const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        null,
        $api.f([$api.i($cmp.items, function (item, index) {
            return $api.h(
                "div",
                {
                    class: "my-list"
                },
                [$api.h(
                    "p",
                    null,
                    [$api.s(item)]
                )]
            );
        })])
    )];
}
export const templateUsedIds = ["items"];
