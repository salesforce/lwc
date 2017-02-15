const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        {},
        [$cmp.isTrue ? $api.h(
            "p",
            {},
            ["1"]
        ) : $api.e(), $cmp.isTrue ? $api.h(
            "p",
            {},
            ["2"]
        ) : $api.e(), $cmp.isTrue ? $api.h(
            "p",
            {},
            ["3"]
        ) : $api.e()]
    )];
}
export const templateUsedIds = ["isTrue"];
