const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        null,
        $api.f([$slotset.$default$ || [$api.h(
            "p",
            null,
            ["Default slot content"]
        )]])
    )];
}
export const templateUsedIds = [];
