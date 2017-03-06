const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        null,
        [$cmp.isTrue ? $api.h(
            "p",
            null,
            ["1"]
        ) : $api.e(), $cmp.isTrue ? $api.h(
            "p",
            null,
            ["2"]
        ) : $api.e(), $cmp.isTrue ? $api.h(
            "p",
            null,
            ["3"]
        ) : $api.e()]
    )];
}
export const templateUsedIds = ["isTrue"];
