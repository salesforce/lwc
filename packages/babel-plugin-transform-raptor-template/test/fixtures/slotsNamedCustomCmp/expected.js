const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        null,
        $api.f([$slotset.test || [$api.h(
            "p",
            null,
            ["Test slot content"]
        )]])
    )];
}
export const templateUsedIds = [];
